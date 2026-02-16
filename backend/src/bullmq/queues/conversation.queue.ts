import { Redis, RedisOptions } from "ioredis";
import { Queue, QueueEvents } from "bullmq";

export const connectionConfig: RedisOptions = {
    host: process.env.REDIS_HOST || "localhost",
    port: 6379,
    maxRetriesPerRequest: null
};

export const client = new Redis(connectionConfig);

export const conversationQueue = new Queue('conversation-queue', {
  connection: connectionConfig 
});

export const conversationQueueEvents = new QueueEvents("conversation-queue", {
  connection: connectionConfig
});
