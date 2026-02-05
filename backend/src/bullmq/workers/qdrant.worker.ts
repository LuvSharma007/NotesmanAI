import dotenv from "dotenv";
dotenv.config();

import { OpenAIEmbeddings } from "@langchain/openai";
import { Worker } from "bullmq";
import { Redis } from "ioredis";
// import { client } from "../../lib/qdrantClient.js";
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


const worker = new Worker("batch-queue", async job => {
    const {qdrantCollection,userId,fileName,url} = job.data;
    try {
        console.log("Starting batch queue");
        console.log("User Url",url);
        
        
        if (job.name === "batchesForText" || job.name==="BatchesForUrl") {
            console.log("Job data:---", job.data.data);
            const embeddings = new OpenAIEmbeddings({
                apiKey: process.env.OPENAI_API_KEY,
                model: "text-embedding-3-large",
                batchSize: 100,  // reduce load
                dimensions:1000
            })

            // generating embeddings for all batches at once
            console.log("creating vectors");

            let inputData = Array.isArray(job.data.data) ? job.data.data : [job.data.data]
            let payload:{};
            if(fileName){
                payload = {
                    text:job.data.data,
                    source:fileName,
                    userId
                }
            }else{
                payload = {
                    text:job.data.data,
                    source:url,
                    metadata:job.data.metadata,
                    userId
                }
            }

            const vectors = await embeddings.embedDocuments(inputData);
            console.log("vectors", vectors);

            await client.upsert(qdrantCollection, {
                batch:{
                    ids:[crypto.randomUUID()],
                    payloads:[{payload}],
                    vectors:vectors
                }
            })
            console.log(`--------Successfully upserted points----------`);
        }
    } catch (error) {
        console.log("Worker failed:", error);
        console.log("removing Qdrant collection");
        client.deleteCollection(qdrantCollection)
        
    }
}, {
    connection,
    concurrency:20
})

worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully.`);
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed: ${err.message}`);
});