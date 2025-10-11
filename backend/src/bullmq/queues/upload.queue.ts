import {Queue} from "bullmq"

export const afterUploadQueue = new Queue('upload-queue')
