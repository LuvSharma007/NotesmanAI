import dotenv from "dotenv";
dotenv.config();


cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_SECRET_KEY
})

import { TextLoader } from "@langchain/classic/document_loaders/fs/text"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
// import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { QdrantVectorStore } from '@langchain/qdrant';
import {Job, Worker} from 'bullmq'
import {v2 as cloudinary} from "cloudinary"
import axios from 'axios';
import path from 'path';
import os from 'os'
import fs from 'fs'
import fileModel from '../../models/file.model.js';
import {Redis} from "ioredis";
import { DB } from "../../db/client.js";
import { OpenAIEmbeddings } from "@langchain/openai";

const connection = new Redis({
    host: "localhost", // or "redis" if using docker-compose
    port: 6379,
    maxRetriesPerRequest: null
}); 

await DB()

const worker = new Worker('file-processing-queue',async (job:Job)=>{
    console.log('starting worker');
    let tempFilePath;
    let fileId;

    try {
        const { publicId ,fileUrl,fileName , diskName , fileType, userId,qdrantCollection} = job.data;
        fileId = job.data.fileId


        console.log(`Processing Job ${job.id} for file:${fileName}`);
        console.log("Downloading URL......");

        // const format = fileName.split('.').pop() || 'pdf'; // fallback to pdf
        // const downloadUrl = cloudinary.utils.private_download_url(publicId, format, {
        //     attachment: true, // force download
        //     resource_type:"raw",
        // });
        console.log("File URL",fileUrl);
        
        const response = await axios({
            method:'GET',
            url:fileUrl,
            responseType:'stream'
        })

        if(!response){
            console.log('No response bro');
        }

        tempFilePath = path.join(os.tmpdir(), fileName);
        const writer = fs.createWriteStream(tempFilePath);
        response.data.pipe(writer);

        await new Promise<void>((resolve, reject) => {
            writer.on('finish', () => resolve());
            writer.on('error', reject);
        });

        console.log(`File downloaded to temporary location: ${tempFilePath}`);
        const extension = path.extname(tempFilePath).toLowerCase().replace('.', '');
        console.log("Extension",extension);
        


        let docs;
        
        if(extension === 'pdf'){
            docs = await new PDFLoader(tempFilePath).load()
        }else if(extension === 'txt'){
            docs = await new TextLoader(tempFilePath).load()
        }else if(extension === 'docx'){
            docs = await new DocxLoader(tempFilePath).load()
        }else{
            throw new Error('Unsupported File type')
        }

        // split into chunks

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize:2000,
            chunkOverlap:200
        })

        const splitDocs = await splitter.splitDocuments(docs)

        console.log("Splitting Done");

        // create Embeddings

        // using Google Gemini

        // const embeddings = new GoogleGenerativeAIEmbeddings({
        //     apiKey: process.env.GEMINI_API_KEY,
        //     model: 'gemini-embedding-001'
        // })

        // openAI embeddings model

        const embeddings = new OpenAIEmbeddings({
            apiKey:process.env.OPENAI_API_KEY,
            model:"text-embedding-3-large"
        })

        console.log("Embeddings setup done");

        const qdrantRes = await QdrantVectorStore.fromDocuments(splitDocs,embeddings,{
            apiKey:process.env.QDRANT_API_KEY,
            url:process.env.QDRANT_URL,
            collectionName:qdrantCollection
        })

        console.log("Successfully saved to Qdrant DB",qdrantRes);

        await fileModel.findByIdAndUpdate(fileId,{status:"completed"})
        console.log(`File ${fileId} marked as completed in MongoDB`);

    } catch (error) {
        await fileModel.findByIdAndUpdate(fileId,{status:"failed"})
        console.error("Worker job failed:", error);
        throw new Error("Error , worker is not working , LOL")        
    }finally {
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
            console.log(`Temporary file deleted: ${tempFilePath}`);
        }
    }
},
{connection}
)

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully.`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed: ${err.message}`);
});