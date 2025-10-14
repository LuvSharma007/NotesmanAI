import dotenv from "dotenv";
dotenv.config();

import {Redis} from "ioredis";
import { DB } from "../../db/client.js";

const connection = new Redis({
    host: "localhost", // or "redis" if using docker-compose
    port: 6379,
    maxRetriesPerRequest: null
}); 

const client = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey:process.env.QDRANT_API_KEY,
    timeout: 60000
});

import { Job , Worker} from "bullmq";
import {v2 as cloudinary} from "cloudinary"
import fileModel from "../../models/file.model.js";
import { QdrantClient } from "@qdrant/js-client-rest";


cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_SECRET_KEY
})

await DB();

const worker = new Worker('delete-file-queue',async (job:Job)=>{
    console.log("started Worker");
    try {
        const {fileId , userId , qdrantCollection , publicId} = job.data;

        const qdrantCollectionDeleted = await client.deleteCollection(qdrantCollection)
        if(!qdrantCollectionDeleted){
            throw new Error("Error deleted qdrant collection")
        }
        console.log('Qdrant collection deleted');
        
        const cloudinaryDeletion = await cloudinary.uploader.destroy(publicId,{resource_type:'raw'})
        if(!cloudinaryDeletion){
            throw new Error("Error deletion cloudinary file")
        }
        console.log('Cloudinary file deleted');
        
        const mongoDBFile = await fileModel.deleteOne({_id:fileId,userId})
        if(!mongoDBFile){
            throw new Error("Error deleting MongoDB file")
        }
        console.log('MonogDB file deleted');

    } catch (error) {
        console.error("Worker job failed:", error);
        throw new Error("Error , worker is not working , LOL")        
    }    
},{connection})

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully.`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed: ${err.message}`);
});