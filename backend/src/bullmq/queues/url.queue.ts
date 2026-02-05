import { Queue } from "bullmq";

export const urlQueue = new Queue('url-queue')