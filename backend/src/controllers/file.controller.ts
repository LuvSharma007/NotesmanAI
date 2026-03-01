import fileModel from "../models/file.model.js";
import { Request, Response } from "express";
import { uploadOnCloudinary } from "../lib/cloudinary.js";
import { fileProcessingQueue } from "../bullmq/queues/upload.queue.js";
import mongoose from "mongoose";
import { deleteFileQueue } from "../bullmq/queues/delete.queue.js";
import urlModel from "../models/url.model.js";
import customUserModel from "../models/customUser.model.js";
import {fileTypeFromFile} from "file-type"
import { allowedMimeTypes, CloudinaryResponse } from "../middlewares/upload.middleware.js";
import fs from "fs/promises"

export const uploadFile = async (req: Request, res: Response) => {
    // check userId
    // validate file
    // validate sources in userModel
    // upload on cloudinary
    // create qdrant collection
    // save the file in fileModel
    // push the data into queue
    try {
        console.log("Controller runned");

        const userId = (req as any).user.id
        console.log(userId);
        if (!userId) {
            return res.status(404).json({
                success: false,
                message: "Unauthorised Access"
            })
        }
        // validate file

        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                error: "No file Provided"
            })
        }

        if (file.size > 10485760) {
            return res.status(400).json({
                success: false,
                message: "File should be lower than 15mb"
            })
        }
        console.log("got the file and Size ", file.size);
        const fileSize = file.size

        // validate file type
        const filePath = req.file?.path;
        let uploadedFile = {} as CloudinaryResponse
        try {
            const type = await fileTypeFromFile(file.path)
            console.log("Type:",type);
            
            const isTxt = req.file?.mimetype === "text/plain"
            if((type && allowedMimeTypes.includes(type.mime)) || isTxt ){
                console.log("Uploading to cloudinary");
        
                console.log("-----------------------", file.path);
                uploadedFile = await uploadOnCloudinary(file.path)
        
                if (!uploadedFile) {
                    throw new Error("File required")
                }
                console.log("Uploaded to cloudinary:", uploadedFile);
            }
        } catch (error) {
            console.log("file type not supported:",error);
            console.log("removing file");            
            await fs.unlink(file.path)
            return res.status(400).json({
                success:false,
                message:"File type not supported"
            })
        }

        // validate sources 
        // find the user exists in customUserModel
        // if exists then (matlab qdrant collection hoga)
        // if not exists then create it
        try {
            const customUserExists = await customUserModel.findOne({ userId })
            console.log("customUserExists:", customUserExists);

            if (customUserExists) {
                if (customUserExists.sourceLimit >= 3) {
                    return res.status(400).json({
                        success: false,
                        message: "Your free tier limit has reached, you should upgrade to pro plan",
                        statusText: "Bad Request"
                    })
                } else {
                    // update the sourceLimit
                    customUserExists.sourceLimit += 1;
                    await customUserExists.save();
                }
                console.log("Successfully updated customUser");
            } else {
                // create qdrantCollection 
                const qdrantCollection = `user_${userId}`
                console.log("qdrantCollection:", qdrantCollection);

                await customUserModel.create({
                    userId,
                    sourceLimit: 1,
                    qdrantCollection
                })
            }
            console.log("Successfully created customUser");

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Something went wrong"
            })
        }

        const fileSaved = await fileModel.create({
            userId,
            name: file.originalname,
            diskName: file.filename,
            fileType: file.mimetype,
            fileSize: file.size,
            url: uploadedFile.secure_url,
            publicId: uploadedFile.public_id,
            // qdrantCollection
        })

        if (!fileSaved) {
            return res.status(400).json({
                success: false,
                error: "No file saved"
            })
        }

        console.log("File saved mongoDB", fileSaved);

        // // add a job to the queue
        console.log("Adding job to processing queue...");

        await fileModel.findByIdAndUpdate(fileSaved._id, { status: "processing" })

        const job = await fileProcessingQueue.add("file-processing-queue", {
            fileId: fileSaved._id.toString(),
            fileUrl: (fileSaved as any).url,
            name: fileSaved.name,
            diskName: fileSaved.diskName,
            fileType: fileSaved.fileType,
            publicId: fileSaved.publicId,
            userId,
            qdrantCollection: `user_${userId}`,
            filePath,
            fileSize,
        }, { removeOnComplete: true, removeOnFail: true })

        console.log(`Job added to the queue ${job}`);


        // removing the file from disk after being processed
        // fs.unlinkSync(filePath);
        // console.log("Temp file deleted:", filePath);


        return res.status(200).json({
            success: true,
            message: "File uploaded successfully",
            statusText: "OK",
            file: {
                id: fileSaved._id.toString(),
                name: fileSaved.name,
                url: fileSaved.url,
                type: fileSaved.fileType,
                size: fileSaved.fileSize,
            },
        })
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({
            success: false,
            message: "Upload failed",
            details: (error as Error).message
        })
    }
}

export const getAllFiles = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id

        const allFiles = await fileModel
            .find({ userId, status: { $nin: ["deleting", "deleted"] } })
            .sort({ createdAt: -1 });
        console.log("allFiles:", allFiles);


        if (!allFiles || allFiles.length === 0) {
            return res.status(200).json({
                success: true,
                files: [],
                message: "No files uploaded"
            })
        }
        return res.status(200).json({
            success: true,
            files: allFiles,
            message: "Successfully reterived all Files"
        })
    } catch (error) {
        console.error("Error fetching files:", error);
        return res.status(500).json({
            success: false,
            message: "Server error fetching files",
            details: (error as Error).message,
        });
    }
}

interface FileDelete {
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    publicId: string,
    qdrantCollection: string
}

export const deleteFile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const id = req.params.id as string;
        const { sourceType } = req.query
        console.log("sourceType:", sourceType);
        console.log("id:", id);

        if (!id || !sourceType) {
            return res.status(400).json({ message: "Missing id or type" })
        }

        if (sourceType !== "file" && sourceType !== "url") {
            return res.status(400).json({ message: "Invalid sourceType" });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid file ID" });
        }

        let deleteAccordingToSource;

        if (sourceType === "file") {
            deleteAccordingToSource = await fileModel.findOne({ _id: id, userId })

            if (!deleteAccordingToSource) {
                return res.status(404).json({ success: false, message: "File not found" })
            }

            const deleteJobForFile = await deleteFileQueue.add('delete-file-queue', {
                id: deleteAccordingToSource.id,
                userId: deleteAccordingToSource.userId,
                publicId: deleteAccordingToSource.publicId,
                qdrantCollection: `user_${userId}`,
                sourceType,
            }, { removeOnComplete: true, removeOnFail: true })

            console.log(`Job added to the queue ${deleteJobForFile}`);

        } else if (sourceType === "url") {

            deleteAccordingToSource = await urlModel.findOne({ _id: id, userId })

            if (!deleteAccordingToSource) {
                return res.status(404).json({ success: false, message: "File not found" })
            }

            const deleteJobForUrl = await deleteFileQueue.add('delete-file-queue', {
                id: deleteAccordingToSource.id,
                userId: deleteAccordingToSource.userId,
                qdrantCollection: `user_${userId}`,
                sourceType,
            }, { removeOnComplete: true, removeOnFail: true })
            console.log(`Job added to the queue ${deleteJobForUrl}`);
        }

        return res.status(200).json({ success: true, message: "File deleted" })

    } catch (error) {
        console.error("Error deleting file:", error);
        res.status(500).json({ success: false, message: "File Deletion Error" })
    }
}

export const initialFileStatus = async (req:Request,res:Response)=>{
    try {
        const fileId = req.params.id as string;
        if (!mongoose.Types.ObjectId.isValid(fileId)) {
            return res.status(400).json({
                message: "File ID is Missing or Invalid"
            });
        }

        console.log("FileID:", fileId);
        const file = await fileModel.findById(fileId)
        if(file?.status === "completed"){
            return res.status(200).json({
                success:200,
                message:"File processed successfully",
                status:file?.status
            })
        }
        return res.status(200).json({
            status:file?.status
        })
        
    } catch (error) {
        return res.status(400).json({
            success:false
        })
    }
}


export const getFileStatus = async (req: Request, res: Response) => {
    try {
        const fileId = req.params.id as string;

        if (!mongoose.Types.ObjectId.isValid(fileId)) {
            return res.status(400).json({
                message: "File ID is Missing or Invalid"
            });
        }

        console.log("FileID:", fileId);

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader("Connection", 'keep-alive');
        res.flushHeaders();

        console.log(`SSE connection opened for file: ${fileId}`);

        const pipeline = [
            { $match: { 'documentKey._id': new mongoose.Types.ObjectId(fileId) } }
        ]

        const changeStream = fileModel.watch(pipeline, { fullDocument: "updateLookup" })

        changeStream.on("change", (change) => {
            if (change.operationType === "update" || change.operationType === "replace") {
                const updateStatus = change.fullDocument?.status;
                res.write(`data: ${JSON.stringify({ status: updateStatus })}\n\n`)
                if (updateStatus === "completed" || updateStatus === "failed") {
                    changeStream.close();
                    res.end();
                }
            }
        })

        req.on("close", () => {
            console.log("Client closed connection");
            changeStream.close();
        })

    } catch (error) {
        if(!res.headersSent) {
            res.status(500).end();
        }
    }

}