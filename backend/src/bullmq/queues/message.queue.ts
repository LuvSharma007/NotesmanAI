import { Queue } from "bullmq";

export const messageQueue = new Queue('message-queue')