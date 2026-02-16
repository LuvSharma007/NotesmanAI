import { Queue } from "bullmq";

export const batchQueue = new Queue('batch-queue')