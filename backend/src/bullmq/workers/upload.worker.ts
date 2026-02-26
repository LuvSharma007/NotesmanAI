cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
})

await DB()
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Worker } from 'bullmq'
import { v2 as cloudinary } from "cloudinary"
import axios from 'axios';
import path from 'path';
import fs from 'fs'
import fileModel from '../../models/file.model.js';
import { createRequire } from "module";
import { batchQueue } from "../queues/batches.queue.js";
import { QdrantClient } from "@qdrant/js-client-rest";

import type { Job } from "bullmq";

import { redisConfig } from "../../lib/redisClient.js";
import { DB } from "../../db/client.js";
import { openai } from "../../lib/openAIClient.js";

const client = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
});


const required = createRequire(import.meta.url)
const convertApi = required('convertapi')(process.env.CONVERT_API_TOKEN);

const worker = new Worker('file-processing-queue', async (job: Job) => {
    console.log('starting worker');
    const { fileUrl, name, qdrantCollection, fileId, filePath, publicId } = job.data;

    try {


        console.log(`Processing Job ${job.id} for file:${name}`);
        console.log("Downloading URL");

        console.log("File URL", fileUrl);
        const extension = path.extname(filePath).toLowerCase().replace('.', '');
        console.log("Extension", extension);
        console.log(filePath);  //public/temp/BCA SEM-6 SYLLABUS .pdf


        // convert the file and save in public/convertedFile

        // const EncodedUrl = encodeURI(fileUrl)
        // console.log("EncodedUrl:",EncodedUrl);


        async function convertDocument() {
            try {
                let result;
                let downloadUrl: string;
                const parsedPath = path.parse(filePath);
                const textFilePath = path.join(parsedPath.dir, parsedPath.name + ".txt").trim();
                fs.mkdirSync(path.dirname(textFilePath), { recursive: true });
                console.log("textFilepath", textFilePath);


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
                // delete the uploaded cloudinary file
                await cloudinary.uploader.destroy(publicId, { resource_type: 'raw', invalidate: true })
                await fileModel.findByIdAndDelete({ _id: fileId })
                console.log('Cloudinary file deleted');
                console.log('MongoDB file schema deleted');
                console.error("Error converting file", error)
            } finally {
                // removing the file from disk after being processed
                if (["pdf", "doc", "docx"].includes(extension.toLowerCase())) {
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
        await fileModel.findByIdAndUpdate(fileId, { status: "chunking" })
        console.log("updated status chunking");

        


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
                try {
                    console.log("Collection Name", qdrantCollection);
                    const qdrantCollectionAlreadyExists = await client.collectionExists(qdrantCollection);
                    console.log("qdrantCollectionAlredyExists:", qdrantCollectionAlreadyExists);

                    if (!qdrantCollectionAlreadyExists.exists) {
                        const collectionCreated = await client.createCollection(qdrantCollection, {
                            vectors: {
                                size: 1000,
                                distance: "Dot"
                            },
                        })
                        console.log("qdrantCollection created successfully", collectionCreated)


                        if (!collectionCreated) {
                            throw new Error("Error creating collection")
                        }
                        // creating index for payload

                        await client.createPayloadIndex(qdrantCollection, {
                            field_name: "payloadValue",
                            field_schema: "keyword",
                            wait: true
                        });

                        console.log("Indexing created Qdrant collection", collectionCreated);
                        console.log("Qdrant collection created", collectionCreated);
                    }

                } catch (error) {
                    await client.deleteCollection(qdrantCollection);
                    console.log("qdrantCOllection deleted");
                    throw new Error("Error creating qdrantCollection")
                }

                // 1.) approuch through highwatermark with batches
                const stream = fs.createReadStream(textFilePath, {
                    encoding: 'utf-8',
                    highWaterMark: 1024 * 24
                })
                let buffer: string | undefined = "";
                let bulkJobs: any[] = [];

                for await (const streamChunk of stream) {
                    buffer += streamChunk;
                    const chunks = await splitter.splitText(buffer);
                    if (chunks.length > 1) {
                        buffer = chunks.pop() ?? "";
                    }
                    console.log("Collection Name", qdrantCollection);
                    for await (const chunk of chunks) {
                        console.log("----------------------------chunk:", chunk);
                        // create a metadata summary for chunk

                        const response = await openai.chat.completions.create({
                            model:"gpt-4.1-mini",
                            messages:[
                                {
                                    role:"system",
                                    content:"You are a Professional AI assistant that summaries the content with max 20 words"
                                },
                                {
                                    role:"user",
                                    content:chunk
                                }
                            ]
                        })
                        const summaryOfChunk = response.choices[0].message.content
                        console.log("Summary of Chunk:",summaryOfChunk);
                        
                        // create keywords
                        const response2 = await openai.chat.completions.create({
                            model:"gpt-4.1-mini",
                            messages:[
                                {
                                    role:"system",
                                    content:"You are a Professional AI assistant that creates max 20 different Keywords from a content , and that keywords relevent and resemble to that content"
                                },
                                {
                                    role:"user",
                                    content:chunk
                                }
                            ]
                        })

                        const keywords = response2.choices[0].message.content
                        console.log("Keywords:",keywords);

                        bulkJobs.push({
                            name: "batchesForText",
                            data: { data: chunk, fileId, name, qdrantCollection ,},
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
                        data: buffer, fileId, name, qdrantCollection
                    }, { removeOnComplete: true, removeOnFail: true })
                }


                console.log("Stream processing completed");
                console.log("data pused to queue");

            } catch (error) {
                console.log("Error processing streams:", error);
                fs.unlinkSync(textFilePath);
                console.log("Temp file deleted:", textFilePath);
            } finally {
                // removing the converted file from disk after being processed
                fs.unlinkSync(textFilePath);
                console.log("Temp file deleted:", textFilePath);
            }
        }

        await processStreamBatches();
        await fileModel.findByIdAndUpdate(fileId, { status: "processing" })
        console.log("updated status processing");
    } catch (error) {
        await fileModel.findByIdAndUpdate(fileId, { status: "failed" })
        console.error("Worker job failed:", error);
        throw new Error("Error , worker is not working , LOL")
    }
},
    {
        connection: redisConfig,
    }
)

worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully.`);
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed: ${err.message}`);
});