import dotenv from "dotenv"
dotenv.config()
import { Job, Worker } from "bullmq";
import { DB } from "../../db/client.js";

import { Redis } from "ioredis";
import FirecrawlApp from '@mendable/firecrawl-js';
import { batchQueue } from "../queues/batches.queue.js";
import { QdrantClient } from "@qdrant/js-client-rest";

const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

const connection = new Redis({
    host: "localhost", // or "redis" if using docker-compose
    port: 6379,
    maxRetriesPerRequest: null
});

const client = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey:process.env.QDRANT_API_KEY,
});

await DB();

const worker = new Worker("url-queue", async (job: Job) => {
    console.log("started worker");
    try {
        const { userId, url, qdrantCollection } = job.data;
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

        if (batchScrape.data.length <= 0) {
            console.log("Scrape failed:", batchScrape);
            throw new Error("Error batching URL")
        }
        // creating qdrant collection
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
        // call qdrant worker or make embeddings


        if (batchScrape.data.length > 0 && Array.isArray(batchScrape.data)) {
            // write the batches in file then read like file upload approuch
            const jobs = batchScrape.data.map((item) => ({
                name: "BatchesForUrl",
                data: {
                    data: item.markdown,
                    metadata: item.metadata,
                    url,
                    userId,
                    qdrantCollection
                }
            }))
            await batchQueue.addBulk(jobs)
            console.log("Jobs added successfully");
        }
    } catch (error) {
        console.error("Worker job failed:", error);
        throw new Error("Error , worker failed")
    }
}, { connection })

worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully.`);
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed: ${err.message}`);
});