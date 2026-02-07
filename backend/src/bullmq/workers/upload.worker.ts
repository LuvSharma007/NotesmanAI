import dotenv from "dotenv";
dotenv.config();


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
})


import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
// import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Job, tryCatch, Worker } from 'bullmq'
import { v2 as cloudinary } from "cloudinary"
import axios from 'axios';
import path from 'path';
import os from 'os'
import fs from 'fs'
import fileModel from '../../models/file.model.js';
import { Redis } from "ioredis";
import { DB } from "../../db/client.js";
import { createRequire } from "module";
import { batchQueue } from "../queues/batches.queue.js";
import { QdrantClient } from "@qdrant/js-client-rest";

const connection = new Redis({
    host: "localhost",
    port: 6379,
    maxRetriesPerRequest: null
});

const client = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey:process.env.QDRANT_API_KEY,
});

await DB()

const required = createRequire(import.meta.url)
const convertApi = required('convertapi')(process.env.CONVERT_API_TOKEN);

const worker = new Worker('file-processing-queue', async (job: Job) => {
    console.log('starting worker');
    let tempFilePath;
    let fileId;

    try {
        const { fileUrl, name, qdrantCollection, filePath, userId, fileSize } = job.data;


        console.log(`Processing Job ${job.id} for file:${name}`);
        console.log("Downloading URL");


        console.log("File URL", fileUrl);

        tempFilePath = path.join(os.tmpdir(),"public", "temp", name);
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
                        FileName: name,
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
                if(["pdf","doc","docx"].includes(extension.toLowerCase())){
                    fs.unlinkSync(filePath);
                    console.log("Temp file deleted:", filePath);
                }
            }
        }

        await convertDocument();

        // calculating the perfect batch size according to the fileSize

        // async function calculateBatchsize(sizeInBytes:number):Promise<number> {

        //     const mbValue = sizeInBytes / 1_000_000;  // convert butes to MB using decimal formaula (1e+6)
        //     let batchSize = 0
        //     if(mbValue <=10){
        //         batchSize = mbValue/5;
        //     }else if(mbValue > 10 && mbValue <=15){
        //         batchSize = mbValue/7;
        //     }else if(mbValue > 15 && mbValue <=20){
        //         batchSize = mbValue/10
        //     }else{
        //         batchSize = mbValue / 20;
        //     }
        //     console.log("batchSize in MB:",batchSize);

        //     return Math.floor(batchSize*1_000_000)
        // }

        // const batchSizeInBytes = await calculateBatchsize(fileSize)
        // console.log("batchSize in Bytes:",batchSizeInBytes);

        // processing the file stream in bacthes

        async function processStreamBatches(
            // batchSizeInBytes:number

        ) {
            const splitter = new RecursiveCharacterTextSplitter({
                chunkSize: 2000,
                chunkOverlap: 200
            })

            const parsedPath = path.parse(filePath);
            const textFilePath = path.join(parsedPath.dir, parsedPath.name + ".txt");
            try {

                // creating qdrant Collection

                // create qdrant collection with user + userId + fileName
                console.log("Collection Name", qdrantCollection);
                const collectionCreated = await client.createCollection(qdrantCollection, {
                    vectors: {
                        size: 1000,
                        distance: "Dot"
                    }
                })

                if (!collectionCreated) {
                    throw new Error("Error creating collection")
                }
                console.log("Qdrant collection created",collectionCreated);

                // 1. )  line by line approach
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

                //         if(batch.length === batchSizeInBytes){
                //             await batchQueue.add("batchesForText",{
                //                 data:batch,
                //                 userId,
                //                 fileName,
                //                 qdrantCollection
                //             });
                //             console.log("Batch created-----:",batch);


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

                // 2.) approuch through highwatermark with batches
                const stream = fs.createReadStream(textFilePath, {
                    encoding: 'utf-8',
                    highWaterMark: 1024 * 16
                })
                let buffer: string | undefined = "";
                let bulkJobs: any[] = [];

                for await (const streamChunk of stream) {
                    buffer += streamChunk;
                    const chunks = await splitter.splitText(buffer);
                    if (chunks.length > 1) {
                        buffer = chunks.pop() ?? "";
                    }
                    for await (const chunk of chunks) {
                        console.log("chunk:", chunk);
                    bulkJobs.push({
                            name: "batchesForText",
                            data: { data: chunk, userId, name, qdrantCollection },
                            opts: { removeOnComplete: true, removeOnFail: true }
                        });

                        if (bulkJobs.length >= 50) {
                            await batchQueue.addBulk(bulkJobs);
                            bulkJobs.length = 0;
                        }
                    }
                }
                if (bulkJobs.length > 0) {
                    await batchQueue.addBulk(bulkJobs);
                }

                // leftover chunks in case
                if (buffer.length > 0) {
                    await batchQueue.add("batchesForText", {
                        data: buffer, userId, name, qdrantCollection
                    },{removeOnComplete:true,removeOnFail:true})
                }


                console.log("Stream processing completed");
                console.log("data pused to queue");

            } catch (error) {
                console.log("Error processing streams:", error);
                fs.unlinkSync(textFilePath);
                console.log("Temp file deleted:", textFilePath);
            }finally{
                // removing the converted file from disk after being processed
                fs.unlinkSync(textFilePath);
                console.log("Temp file deleted:", textFilePath);
            }
        }
        
        await processStreamBatches();

    } catch (error) {
        await fileModel.findByIdAndUpdate(fileId, { status: "failed" })
        console.error("Worker job failed:", error);
        throw new Error("Error , worker is not working , LOL")
    }
},
    {
        connection,
    }
)

worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully.`);
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed: ${err.message}`);
});