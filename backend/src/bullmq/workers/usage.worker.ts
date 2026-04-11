// import { Worker } from "bullmq";
// import { redisClient } from "../../lib/redisClient.js";

// const worker = new Worker('usage-sync',async(job)=>{
//     const {userId} = job.data
//     console.log("userId",userId);
    
//     const user = redisClient.scan(`usage${userId}`)

// })