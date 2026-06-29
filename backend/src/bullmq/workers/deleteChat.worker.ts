// import type { Job } from "bullmq";
// import { redisConfig } from "../../lib/redisClient.js"; 
// import {Worker} from "bullmq";
// import messageModel from "../../models/messages.model.js";
// import { DB } from "../../db/client.js";
// import conversationModel from "../../models/conversation.model.js";

// await DB();
// const worker = new Worker('delete-chat-queue',async (job:Job)=>{
//     console.log("delete chat started");
    
//     try {
//         const {chatId,userId} = job.data;
//         console.log("chatId:",chatId);
//         console.log("userId:",userId);

//         await messageModel.deleteMany({conversationId:chatId,userId})

//         await conversationModel.deleteOne({_id:chatId})

//     } catch (error) {
//         console.error("Worker job failed:", error);
//         throw new Error("Error , worker is not working , LOL")        
//     }

// },{connection:redisConfig})

// worker.on('completed', (job) => {
//   console.log(`Job ${job.id} completed successfully.`);
// });

// worker.on('failed', (job, err) => {
//   console.error(`Job ${job?.id} failed: ${err.message}`);
// });