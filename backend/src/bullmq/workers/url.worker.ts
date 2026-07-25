import { Worker } from "bullmq";
import FirecrawlApp from '@mendable/firecrawl-js';
import { batchQueue } from "../queues/batches.queue.js";
import { QdrantClient } from "@qdrant/js-client-rest";
import path from "path";
import fs from "fs"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import urlModel from "../../models/url.model.js";
import type { Job } from "bullmq";
// const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

import { redisConfig } from "../../lib/redisClient.js";
import { DB } from "../../db/client.js";
import { BathcScrapeRes, BathcScrapeResData, BathcScrapeResMain } from "../../Types/firecraw.types.js";
import { Readable } from "stream";
import { error } from "console";
import { pipeline } from "stream/promises";

await DB()
const client = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
});


const worker = new Worker("url-queue", async (job: Job) => {
    console.log("started worker");
    const { userId, urls, qdrantCollection, name, urlId } = job.data;
    // making a file for batches 
    const rootDir = process.cwd();
    const dirPath = path.join(rootDir, "public", "temp");
    const filePath = path.join(dirPath, `scrapingURL-${qdrantCollection}.md`)
    console.log("Filepath", filePath);
    try {
        if (!userId || urls.length === 0) {
            throw new Error("userId or urls not found")
        }
        console.log("userId:", userId);
        console.log("urls:", urls);

        let data
        try {
            const response = await fetch('http://firecrawl-api:3002/v2/batch/scrape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    urls: urls,
                    formats: ['markdown',{type:'json'}],
                })
            });
            data = await response.json() as BathcScrapeResMain  
            console.log("Firecrawl Response:",data);  
            
            // poll status endpoint until completion
            const statusUrl = `http://firecrawl-api:3002/v2/batch/scrape/${data.id}`
            let jobResult;
            while (true) {
                const statusRes = await fetch(statusUrl);
                jobResult = await statusRes.json();
                console.log("Current job status:",jobResult.status);                

                if(jobResult.status === "completed"){
                    break;
                }else if(jobResult.status === "failed"){
                    throw new Error(`Batch scrape failed:${jobResult.error}`)
                }

                await new Promise((res)=> setTimeout(res,2000));

            }
            // update the status in DB
            fs.mkdirSync(dirPath,{recursive:true}); 
            await urlModel.findByIdAndUpdate(urlId,{status:"chunking"});
            console.log("update status chunking");

            // stream and save the data in a file
            const scrapeContent = JSON.stringify(jobResult.data || jobResult);
            const readableStream = Readable.from([scrapeContent]);
            const writer = fs.createWriteStream(filePath,{flags:'a'})

            await pipeline(readableStream,writer)

            console.log(`Data successfully written to ${filePath}`);
            
        } catch (error) {
            console.log("Error fetching URLs:",error);
            throw new Error("Error fetching URLs using firecrawl")            
        }

        try {

            // creating a qdrant collection 
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
                throw new Error("Error creating qdrantCollection")
            }
            // set up splitter
            const splitter = new RecursiveCharacterTextSplitter({
                chunkSize: 2000,
                chunkOverlap: 200
            })

            // receive the data from file and push it to the queue in bulk

            const stream = fs.createReadStream(filePath, {
                encoding: 'utf-8',
                highWaterMark: 1024 * 16
            })
            let buffer: string | undefined = "";
            let bulkJobs: any[] = [];
            // let summaryOfChunk: string = ""
            // let keywords = [];

            for await (const streamChunk of stream) {
                buffer += streamChunk;
                const chunks = await splitter.splitText(buffer);
                if (chunks.length > 1) {
                    buffer = chunks.pop() ?? "";
                }
                for await (const chunk of chunks) {
                    console.log("chunk:-----", chunk.length);

                    // create a metadata summary for chunk

                    // const response = await openai.chat.completions.create({
                    //     model: "gpt-4.1-mini",
                    //     messages: [
                    //         {
                    //             role: "system",
                    //             content: "You are a Professional AI assistant that summaries the content with max 20 words"
                    //         },
                    //         {
                    //             role: "user",
                    //             content: chunk
                    //         }
                    //     ]
                    // })
                    // summaryOfChunk = response.choices[0].message.content!

                    // console.log("Summary of Chunk:", summaryOfChunk);

                    // // create keywords
                    // const response2 = await openai.chat.completions.create({
                    //     model: "gpt-4.1-mini",
                    //     messages: [
                    //         {
                    //             role: "system",
                    //             content: "You are a Professional AI assistant that creates max 10 different Keywords from a contentand that keywords relevent and resemble to that content. return only JSON Object with keywords , key containing an array of strings , example : {\"keywords\": [\"tag1\",\"tag1\"] } "
                    //         },
                    //         {
                    //             role: "user",
                    //             content: chunk
                    //         }
                    //     ],
                    //     response_format: { type: "json_object" }
                    // })
                    // console.log("response2:", response2.choices[0].message);


                    // try {
                    //     const content = response2.choices[0].message.content;
                    //     if (content) {
                    //         const parseResponse = JSON.parse(content);
                    //         keywords = parseResponse.keywords || [];
                    //     }
                    // } catch (error) {
                    //     throw new Error("something went wrong while creating keywords")
                    // }


                    bulkJobs.push({
                        name: "batchesForUrl",
                        data: {
                            data: chunk, urlId, urls, qdrantCollection,
                            // summaryOfChunk , keywords
                        },
                        opts: { removeOnComplete: true, removeOnFail: true }
                    })

                    if (bulkJobs.length >= 50) {
                        await batchQueue.addBulk(bulkJobs);
                        bulkJobs.length = 0;
                    }
                    console.log("Data pused to queue:------------", chunk.length);
                }

            }
            if (bulkJobs.length > 0) {
                await batchQueue.addBulk(bulkJobs)
            }
            // leftover chunks in case
            if (buffer.length > 0) {
                await batchQueue.add("batchesForUrl", {
                    data: buffer, urlId, urls, name, qdrantCollection,
                    // summaryOfChunk , keywords
                }, { removeOnComplete: true, removeOnFail: true })
            }

            console.log("Stream processing completed");
            console.log("data pushed to queue");

            await urlModel.findByIdAndUpdate(urlId, { status: "processing" })
            console.log("status updated Processing");
        } catch (error) {
            console.log("Error writing data", error);
            // fs.unlinkSync(filePath);
            // console.log("Temp file deleted:", filePath);
            client.deleteCollection(qdrantCollection)
            console.log("removed Qdrant collection");
            await urlModel.findByIdAndDelete({ _id: urlId })
            console.log("MongoDB url schema deleted");
            throw new Error("Error writing Data:");
        }
    } catch (error) {
        console.error("Worker job failed:", error);
        throw new Error("Error , worker failed")
    } finally {
        // removing the converted file from disk after being processed
        // fs.unlinkSync(filePath);
        // console.log("Temp file deleted:", filePath);
    }
}, { connection: redisConfig })

worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully.`);
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed: ${err.message}`);
});