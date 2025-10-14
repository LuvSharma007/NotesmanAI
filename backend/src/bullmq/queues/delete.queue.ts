import { Queue } from "bullmq";

export const deleteFileQueue = new Queue('delete-file-queue')