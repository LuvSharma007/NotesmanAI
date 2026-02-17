import { OpenAIEmbeddings } from "@langchain/openai";
import type { Job } from "bullmq";
import {Worker} from "bullmq";
import { QdrantClient } from "@qdrant/js-client-rest";

import { redisConfig } from "../../lib/redisClient.js"; 

const client = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey:process.env.QDRANT_API_KEY,
});


const worker = new Worker("batch-queue", async( job:Job) => {
    const {qdrantCollection,fileId,name,urlId} = job.data;
    try {
        console.log("Starting batch queue");
        console.log("User Name",name);
        console.log("fileId",fileId);
        console.log("urlId",fileId);
        console.log("QdrantCollection",qdrantCollection);
        
        if (job.name === "batchesForText" || job.name==="batchesForUrl") {
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
            let payload = {
                    text:job.data.data,
                    source:name,
                    payloadValue:String(fileId || urlId)
            }

            const vectors = await embeddings.embedDocuments(inputData);
            console.log("vectors", vectors);

            await client.upsert(qdrantCollection, {
                batch:{
                    ids:vectors.map(()=> crypto.randomUUID()),
                    payloads: vectors.map(()=> payload),
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
    connection:redisConfig,
    concurrency:20,
    skipVersionCheck:true
})

worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully.`);
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed: ${err.message}`);
});