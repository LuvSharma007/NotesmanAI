import { Queue } from "bullmq";

const connection = {
  host: process.env.REDIS_HOST || "redis-stack",
  port: 6379
};

export const deleteChatQueue = new Queue('delete-chat-queue',{
    connection
})