import dotenv from "dotenv";
dotenv.config();

import { Job , Worker } from "bullmq";
import messageModel from "../../models/messages.model.js";
import { DB } from "../../db/client.js";
import {Redis} from "ioredis";

const connection = new Redis({
    host:"localhost",
    port:6379,
    maxRetriesPerRequest:null
})

await DB();

const worker = new Worker('message-queue',async (job:Job)=>{
    console.log("Starting worker");

    try {
        const {fileId,userId,userMessage,aiMessage,fileName} = job.data;
        
        if(!fileId || !userId || userMessage || aiMessage || fileName){
            console.error("Context is misssing:",aiMessage);
        }
        
        
        console.log(`Processing Job ${job.id} for file:${fileName}`);

        const messageSaved = await messageModel.insertMany(
            [
            {
                fileId,
                userId,
                role:'user',
                content:userMessage
            },
            {
                fileId,
                userId,
                role:'assisstant',
                content:aiMessage
            }
        ]
    )
    console.log(`Messages saved in mongoDB`,messageSaved);

    // saving in the redis

    const userMsg = JSON.stringify({
        role:"user",
        content:userMessage,
        createdAt:new Date()
    })

    const aiMsg = JSON.stringify({
        role:"assistant",
        content:aiMessage,
        createdAt:new Date()
    })

    const RedisMessageSaved = await connection.rpush(`chat:${userId}:${fileId}`,userMsg,aiMsg);
    await connection.expire(`chat:${userId}:${fileId}`,36000) // expire the messages after one hour

    await connection.ltrim(`chat:${userId}:${fileId}`,-20,-1);
    console.log("Message Saved in redis:",RedisMessageSaved);
    

    } catch (error) {
        console.error("Worker job failed:",error);
        throw new Error("Error , worker is not working")
    }
},
{connection})

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully.`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed: ${err.message}`);
});