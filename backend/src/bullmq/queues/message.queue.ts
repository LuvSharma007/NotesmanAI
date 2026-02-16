import { Queue } from "bullmq";

export const messageQueue = new Queue('save-message-queue')