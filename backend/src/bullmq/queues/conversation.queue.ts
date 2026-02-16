import { Queue, QueueEvents } from "bullmq";
import {client} from "../../lib/redisClient.js"

export const conversationQueue = new Queue('conversation-queue',{connection:client})

export const conversationQueueEvents = new QueueEvents("conversation-queue", {
  connection:client,
});