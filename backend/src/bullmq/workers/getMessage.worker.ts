import { Job , Worker } from "bullmq";
import {Redis} from "ioredis";

const connection = new Redis({
    host:"localhost",
    port:6379,
    maxRetriesPerRequest:null
})

const worker = new Worker('conversation-queue',async(job:Job)=>{
    console.log("Get messages worker runned");

    try {
        const {id,userId} = job.data;
        console.log("id",id);
        console.log("UserId",userId);

        const messagesId = `chat:${userId}:${id}`
        
        const messages = await connection.lrange(messagesId,0,-1);
        if(messages.length === 0){
            console.error("No messages return from redis");
            return null;
        }
        console.log("Messages from redis:",messages);  
        
        return messages;
        
    } catch (error) {
        console.error("Worker job failed:",error);
        throw new Error("Error , worker is not working")
    }    
},
{connection})

worker.on('completed',(job)=>{
    console.log(`Job ${job.id} completed successfully`);
})

worker.on('failed',(job)=>{
    console.log(`Job ${job?.id} completed failed`);
})