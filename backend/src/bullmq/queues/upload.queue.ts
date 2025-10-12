import {Queue} from "bullmq"

export const fileProcessingQueue = new Queue('file-processing-queue')

