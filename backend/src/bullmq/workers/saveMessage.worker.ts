import { Worker } from "bullmq";
import messageModel from "../../models/messages.model.js";

import type { Job} from "bullmq";

import { redisConfig } from "../../lib/redisClient.js"; 
import { redisClient } from "../../lib/redisClient.js";
import { DB } from "../../db/client.js";

await DB()
const worker = new Worker('save-message-queue',async (job:Job)=>{
    console.log("Starting worker");

    try {
        const {conversationId,userId,userMessage,aiMessage,reasoning} = job.data;
        console.log("ConversationId",conversationId);
        console.log("userId",userId);        
        
        if(!conversationId || !userId || !userMessage || !aiMessage){
            throw new Error("Context is missing")
        }
        
        console.log(`Processing Job ${job.id} for file`);

        const messageSaved = await messageModel.insertMany(
            [
            {
                conversationId,
                userId,
                role:"user",
                content:userMessage
            },
            {
                conversationId,
                userId,
                role:'thinking',
                content:reasoning,
            },
            {
                conversationId,
                userId,
                role:'assistant',
                content:aiMessage
            }
        ]
    )
    console.log(`Messages saved in mongoDB`,messageSaved);

    // saving in the redis

    // const userMsg = JSON.stringify({
    //     _id:messageSaved[0]._id,
    //     role:"user",
    //     content:userMessage,
    //     createdAt:new Date()
    // })

    // const aiMsg = JSON.stringify({
    //     _id:messageSaved[1]._id,
    //     role:"assistant",
    //     content:aiMessage,
    //     createdAt:new Date()
    // })

    // const RedisMessageSaved = await redisClient.rpush(`chat:${userId}:${conversationId}`,userMsg,aiMsg);
    // await redisClient.ltrim(`chat:${userId}:${conversationId}`,-20,-1);  // Negative indexes: Negative numbers can be used to specify offsets from the end of the list, where -1 is the last element, -2 is the penultimate
    // await redisClient.expire(`chat:${userId}:${conversationId}`,1800) // expire the messages after half an hour
    // console.log("Message Saved in redis:",RedisMessageSaved);
    
    } catch (error) {
        console.error("Worker job failed:",error);
        throw new Error("Error , worker is not working")
    }
},
{connection:redisConfig})

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully.`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed: ${err.message}`);
});