import dotenv from "dotenv";
dotenv.config();


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
})

import { TextLoader } from "@langchain/classic/document_loaders/fs/text"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
// import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { Job, tryCatch, Worker } from 'bullmq'
import { v2 as cloudinary } from "cloudinary"
import axios from 'axios';
import path from 'path';
import os from 'os'
import fs, { write } from 'fs'
import fileModel from '../../models/file.model.js';
import { Redis } from "ioredis";
import { DB } from "../../db/client.js";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createRequire } from "module";
import { pipeline } from "stream/promises";
import { url } from "inspector";
import { isGeneratorFunction } from "util/types";
import { Readable, Transform } from "stream";
import readline from "readline";
import { batchQueue } from "../queues/batches.queue.js";
import {client} from "../../lib/qdrantClient.js"
import { promisify } from "util";

const connection = new Redis({
    host: "localhost",
    port: 6379,
    maxRetriesPerRequest: null
});

await DB()

const required = createRequire(import.meta.url)
const convertApi = required('convertapi')(process.env.CONVERT_API_TOKEN);

const worker = new Worker('file-processing-queue', async (job: Job) => {
    console.log('starting worker');
    let tempFilePath;
    let fileId;

    try {
        const { fileUrl, fileName, qdrantCollection, filePath,userId } = job.data;
        fileId = job.data.fileId


        console.log(`Processing Job ${job.id} for file:${fileName}`);
        console.log("Downloading URL");

        // const format = fileName.split('.').pop() || 'pdf'; // fallback to pdf
        // const downloadUrl = cloudinary.utils.private_download_url(publicId, format, {
            //     attachment: true, // force download
            //     resource_type:"raw",
        // });
        console.log("File URL", fileUrl);
        // try {
        //     const response = await axios({
        //         method: 'GET',
        //         url: fileUrl,
        //         responseType: 'stream',
        //     })
        
        //     tempFilePath = path.join(os.tmpdir(), fileName);
        //     const writer = fs.createWriteStream(tempFilePath);
        //     response.data.pipe(writer);

        //     await new Promise<void>((resolve, reject) => {
        //         writer.on('finish', () => resolve());
        //         writer.on('error', reject);
        //     });
        // } catch (error) {
        //     console.log("Error getting response:",error);
        //     throw new Error("Error getting FileUrl")
        // }

        tempFilePath = path.join(os.tmpdir(), fileName);
        console.log(`File downloaded to temporary location: ${tempFilePath}`);
        const extension = path.extname(filePath).toLowerCase().replace('.', '');
        console.log("Extension", extension);
        console.log(filePath);
        

        // convert the file and save in public/convertedFile

        // const EncodedUrl = encodeURI(fileUrl)
        // console.log("EncodedUrl:",EncodedUrl);

        
        async function convertDocument() {
            try {
                let result;
                let downloadUrl: string;
                const parsedPath = path.parse(filePath);
                const textFilePath = path.join(parsedPath.dir, parsedPath.name + ".txt");

                if (extension === 'txt') {
                    downloadUrl = fileUrl;
                } else if (['pdf', 'doc', 'docx',].includes(extension.toLowerCase())) {
                    result = await convertApi.convert("txt", {
                        File: fileUrl,
                        FileName: fileName,
                    }, extension);

                    console.log("result:", result);
                    console.log("Response files :", result.response.Files);

                    downloadUrl = result.response.Files[0].Url;
                } else {
                    throw new Error("Unsupported File Format")
                }

                try {

                    const response = await axios({
                        method: 'GET',
                        url: downloadUrl,
                        responseType: "stream"
                    })
                    console.log("Response Streaming end");
                    // const cleaner = new Transform({
                        
                    //     transform(chunk,encoding,callback){
                    //         const cleaned = chunk.toString()
                    //         .replace(/[ \t]+/g,' ')
                    //         .replace(/^\s*[\r\n]/gm,'');
                    //         callback(null,cleaned)                            
                    //     }
                    // })
                    
                    
                    const writer = fs.createWriteStream(textFilePath);
                    // await pipeline(response.data,cleaner,writer)
                    await response.data.pipe(writer)

                    await new Promise<void>((resolve, reject) => {
                        writer.on('finish', () => resolve());
                        writer.on('error', reject);
                    });

                    console.log(`File successfully written to text file ${textFilePath} `);
                } catch (error) {
                    if (axios.isAxiosError(error)) {
                        console.error(`Axios Error:${error.message} (Status:${error.response?.status}) `)
                    } else {
                        console.error(`Stream-File System Error:`, error)
                    }

                    if (fs.existsSync(textFilePath)) {
                        fs.unlinkSync(textFilePath);
                    }
                }
            } catch (error) {
                console.error("Error converting file", error)
            } finally {
                // removing the file from disk after being processed
                // fs.unlinkSync(filePath);
                // console.log("Temp file deleted:", filePath);
            }
        }

        await convertDocument();


        // processing the file stream in bacthes

        async function processStreamBatches(batchSizeInBytes: 1024) {
            const splitter = new RecursiveCharacterTextSplitter({
                chunkSize: 5000,
                chunkOverlap: 500
            })

            try {
                const parsedPath = path.parse(filePath);
                const textFilePath = path.join(parsedPath.dir, parsedPath.name + ".txt");

                // line by line approach
                // const stream = fs.createReadStream(textFilePath)
                // const rl = readline.createInterface({
                //     input: stream,
                //     crlfDelay: Infinity
                // })


                // let batch: string[] = [];

                // console.log("Ready to push into queue");

                // for await (const line of rl) {
                //     const text = line.trim();
                //     if (!text) {
                //         continue;
                //     }
                //     let chunks = await splitter.splitText(text)

                //     for (const chunk of chunks){
                //         batch.push(chunk);

                //         if(batch.length === batchSize){
                //             await batchQueue.add("batchesForText",{
                //                 data:batch,
                //                 userId,
                //                 fileName,
                //                 qdrantCollection
                //             });

                //             batch = [];
                //         }
                //     }
                // }
                // if(batch.length >0){
                //     console.log("pushing remaining batch",batch.length);

                //     await batchQueue.add("batchesForText",{
                //         data:batch,
                //         userId,
                //         fileName,
                //         qdrantCollection
                //     });
                // }
                // console.log("batches completed");

                const stream = fs.createReadStream(textFilePath,{
                    encoding:'utf-8',
                    highWaterMark:batchSizeInBytes
                })

                for await (const chunk of stream){
                    await batchQueue.add("batchesForText",{
                        data:chunk,
                        userId,
                        fileName,
                        qdrantCollection
                    })
                }
                
                console.log("Stream processing completed");                                
                console.log("data pused to queue");
                
            } catch (error) {
                console.log("Error processing streams:", error);
            }
        }

        await processStreamBatches(1024);

        // 1 approach

        // let docs;

        // if (extension === 'pdf') {
        //     docs = await new PDFLoader(filePath).load()   // load everthing in memory (BAD)
        // } else if (extension === 'txt') {
        //     docs = await new TextLoader(filePath).load()
        // } else if (extension === 'docx') {
        //     docs = await new DocxLoader(filePath).load()
        // } else {
        //     throw new Error('Unsupported File type')
        // }

        // // // validate

        // if (docs.length === 0) {
        //     throw new Error("Document does not load properly")
        // } else {
        //     console.log("Docs:", docs.length);
        //     console.log("Docs:", docs);
        // }


        // // split into chunks

        // const splitter = new RecursiveCharacterTextSplitter({
        //     chunkSize:5000,
        //     chunkOverlap:500
        // })    

        // const splitDocs = await splitter.   // splitter can't receive data as streams

        // if(splitDocs.length === 0){
        //     throw new Error("Document does not split properly")
        // }else{
        //     console.log("Splitting Done",splitDocs.length);
        //     console.log("Splitting Done",splitDocs);
        // }


        // 2 approach

        // const readStream = fs.createReadStream(tempFilePath)

        // readStream.on("data",(chunk)=>{
        //     // chunks come in buffer default
        //     console.log(`${chunk.length}, Chunk:${chunk}`);
        // })

        // readStream.on("end",()=>{
        //     console.log("Streaming end");            
        // })

        // readStream.on("error",(err)=>{
        //     throw new Error("Error during streaming",err)
        // })

        // // create Embeddings

        // // using Google Gemini

        // const embeddings = new GoogleGenerativeAIEmbeddings({
        //     apiKey: process.env.GEMINI_API_KEY,
        //     model: 'gemini-embedding-001'
        // })

        // openAI embeddings model

        // const embeddings = new OpenAIEmbeddings({
        //     apiKey: process.env.OPENAI_API_KEY,
        //     model: "text-embedding-3-large",
        //     batchSize: 100  // reduce load
        // })

        // console.log("Embeddings setup done");

        // const qdrantRes = await QdrantVectorStore.fromDocuments(docs, embeddings, {
        //     apiKey: process.env.QDRANT_API_KEY,
        //     url: process.env.QDRANT_URL,
        //     collectionName: qdrantCollection
        // })
        // if (!qdrantRes) {
        //     throw new Error("Qdrant response is missing")
        // }

        // console.log("Successfully saved to Qdrant DB", qdrantRes);

        // await fileModel.findByIdAndUpdate(fileId, { status: "completed" })
        // console.log(`File ${fileId} marked as completed in MongoDB`);

    } catch (error) {
        await fileModel.findByIdAndUpdate(fileId, { status: "failed" })
        console.error("Worker job failed:", error);
        throw new Error("Error , worker is not working , LOL")
    } finally {
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
            console.log(`Temporary file deleted: ${tempFilePath}`);
        }
    }
},
    {
        connection,
        removeOnComplete: { count: 10 }

    }
)

worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully.`);
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed: ${err.message}`);
});