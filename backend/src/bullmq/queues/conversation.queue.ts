import { Redis} from "ioredis";
import { Queue, QueueEvents } from "bullmq";

import { redisConfig } from "../../lib/redisClient.js";

export const client = new Redis(redisConfig);

export const conversationQueue = new Queue('conversation-queue', {
  connection: redisConfig 
});

export const conversationQueueEvents = new QueueEvents("conversation-queue", {
  connection: redisConfig
});
