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
    const {qdrantCollection,userId,fileName} = job.data;
    try {
        console.log("Starting batch queue");


        if (job.name === "batchesForText") {
            console.log("Job data:---", job.data.data);

            const collectionResponse = await client.getCollections()
            const collectionExists = collectionResponse.collections.some(
                (c) => c.name === qdrantCollection
            ) 

            // create qdrant collection with user + userId + fileName
            if(!collectionExists){
                console.log("Collection Name",qdrantCollection);            
                const collectionCreated = await client.createCollection(qdrantCollection,{
                    vectors:{
                        size:1000,
                        distance:"Dot"
                    }
                })
    
                if(!collectionCreated){
                    throw new Error("Error creating collection")
                }
                console.log(collectionCreated);

            }

            const embeddings = new OpenAIEmbeddings({
                apiKey: process.env.OPENAI_API_KEY,
                model: "text-embedding-3-large",
                batchSize: 100,  // reduce load
                dimensions:1000
            })

            // generating embeddings for all batches at once
            console.log("creating vectors");

            const vectors = await embeddings.embedDocuments(job.data.data);
            console.log("vectors", vectors);

            const points = job.data.data.map((text: string, index: number) => ({
                id: crypto.randomUUID(), // Each point needs a UNIQUE ID
                vector: vectors[index],   // Match the specific vector for this text
                payload: {
                    text,
                    source: fileName,
                    userId: userId
                }
            }));

            await client.upsert(qdrantCollection, {points})
            console.log(`Successfully upserted points`);
        }
    } catch (error) {
        console.log("Worker failed:", error);
        console.log("removing Qdrant collection");
        client.deleteCollection(qdrantCollection)
        
    }
}, {
    connection,
})

worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully.`);
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed: ${err.message}`);
});