import dotenv from "dotenv"
dotenv.config()
import { Job, Worker } from "bullmq";
import { DB } from "../../db/client.js";

import { Redis } from "ioredis";
import FirecrawlApp from '@mendable/firecrawl-js';
import { batchQueue } from "../queues/batches.queue.js";
import { QdrantClient } from "@qdrant/js-client-rest";
import path from "path";
import fs from "fs"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

const connection = new Redis({
    host: "localhost", // or "redis" if using docker-compose
    port: 6379,
    maxRetriesPerRequest: null
});

const client = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
});

await DB();

const worker = new Worker("url-queue", async (job: Job) => {
    console.log("started worker");
    const { userId, url, qdrantCollection,name } = job.data;
    // making a file for batches 
            const rootDir = process.cwd();
            const dirPath = path.join(rootDir, "public", "temp");
            const filePath = path.join(dirPath, `${qdrantCollection}.txt`)
            console.log("Filepath", filePath);
    try {
        if (!userId || !url) {
            throw new Error("userId or url not found")
        }
        console.log("userId:", userId);
        console.log("url:", url);

        // batch scrape firecwral

        const batchScrape = await firecrawl.batchScrape(
            [url],
            { options: { formats: ['markdown'] } }
        )       

        if (batchScrape.data.length > 0) {
            // save the batches in a file
            
            fs.mkdirSync(dirPath, { recursive: true });
            try {

                // write data into file
                const writer = fs.createWriteStream(filePath, { flags: 'a' });
                batchScrape.data.forEach((item) => {
                    if (item.markdown) {
                        writer.write(item.markdown)
                    }
                })

                writer.end();
                writer.on("finish", () => {
                    console.log(`Data successfully written to ${filePath}`);
                })

                writer.on("error", () => {
                    console.log(`Error writing data to ${filePath}`);
                })

                // creating a qdrant collection 
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
                console.log("Qdrant collection created", collectionCreated);

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

                for await (const streamChunk of stream) {
                    buffer += streamChunk;
                    const chunks = await splitter.splitText(buffer);
                    if (chunks.length > 1) {
                        buffer = chunks.pop() ?? "";
                    }
                    for await (const chunk of chunks) {
                        console.log("chunk:-----", chunk.length);
                        bulkJobs.push({
                            name: "BatchesForUrl",
                            data: { data: chunk, userId, url, qdrantCollection },
                            opts: { removeOnComplete: true, removeOnFail: true }
                        })

                        if (bulkJobs.length >= 50) {
                            await batchQueue.addBulk(bulkJobs);
                            bulkJobs.length = 0;
                        }                        
                        console.log("Data pused to queue:------------",chunk.length);
                    }
                    
                }
                if(bulkJobs.length > 0){
                    await batchQueue.addBulk(bulkJobs)
                }
                // leftover chunks in case
                if (buffer.length > 0) {
                    await batchQueue.add("batchesForText", {
                        data: buffer, userId, url, qdrantCollection
                    },{removeOnComplete:true,removeOnFail:true})
                }

                console.log("Stream processing completed");
                console.log("data pushed to queue");

            } catch (error) {
                console.log("Error writing data", error);
                fs.unlinkSync(filePath);
                console.log("Temp file deleted:", filePath);
                client.deleteCollection(qdrantCollection)
                console.log("removed Qdrant collection");
                throw new Error("Error writing Data:");
            }
        }
    } catch (error) {
        console.error("Worker job failed:", error);
        throw new Error("Error , worker failed")
    }finally{
        // removing the converted file from disk after being processed
        fs.unlinkSync(filePath);
        console.log("Temp file deleted:", filePath);
    }
}, { connection })

worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully.`);
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed: ${err.message}`);
});