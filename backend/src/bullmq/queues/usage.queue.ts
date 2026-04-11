// import { Queue } from "bullmq";
// import { redisConfig } from "../../lib/redisClient.js";


// export const usageQueue = new Queue('usage-queue',{connection:redisConfig})

// await usageQueue.add(
//     'sync-to-Db',
//     {},
//     {
//         repeat:{
//             pattern:'*/5 * * * *',
//         },
//         removeOnComplete:true
//     }
// )