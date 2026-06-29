// import type { Job } from "bullmq";
// import {Worker} from "bullmq";

// import { redisConfig } from "../../lib/redisClient.js"; 
// import { redisClient } from "../../lib/redisClient.js";
// import { DB } from "../../db/client.js";

// await DB()
// const worker = new Worker('conversation-queue',async(job:Job)=>{
//     console.log("Get messages worker runned");

//     try {
//         const {conversationId,userId} = job.data;
//         console.log("conversationID",conversationId);
//         console.log("UserId",userId);

//         const messagesId = `chat:${userId}:${conversationId}`
        
//         const messages = await redisClient.lrange(messagesId,0,-1);
//         if(messages.length === 0){
//             console.error("No messages return from redis");
//             return null;
//         }
//         console.log("Messages from redis:",messages);  
        
//         return messages;
        
//     } catch (error) {
//         console.error("Worker job failed:",error);
//         throw new Error("Error , worker is not working")
//     }    
// },
// {connection:redisConfig})

// worker.on('completed',(job)=>{
//     console.log(`Job ${job.id} completed successfully`);
// })

// worker.on('failed',(job)=>{
//     console.log(`Job ${job?.id} completed failed`);
// })