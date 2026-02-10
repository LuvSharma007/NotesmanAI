import fileModel from "../models/file.model.js";
import { Request, Response } from "express";
import { uploadOnCloudinary } from "../lib/cloudinary.js";
import { fileProcessingQueue } from "../bullmq/queues/upload.queue.js";
import mongoose from "mongoose";
import { deleteFileQueue } from "../bullmq/queues/delete.queue.js";
import urlModel from "../models/url.model.js";
import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import customUserModel from "../models/customUser.model.js";

export const uploadFile = async (req: Request, res: Response) => {
    // check userId
    // validate sources in userModel
    // validate file
    // upload on cloudinary
    // create qdrant collection
    // save the file in fileModel
    // push the data into queue
    try {
        console.log("Controller runned");
        
        const userId = (req as any).user.id
        console.log(userId);        
        if(!userId){
            return res.status(404).json({
                success:false,
                message:"Unauthorised Access"
            })
        }

        // validate sources 
        // find the user exists in customUserModel
        // if exists then (matlab qdrant collection hoga)
        // if not exists then create it
        try {
            const customUserExists = await customUserModel.findOne({userId})
            console.log("customUserExists:",customUserExists);
            
            if(customUserExists){
                if(customUserExists.sourceLimit >=3){
                    return res.status(400).json({
                        success:false,
                        message:"Limit exceeds,max upload is 3"
                    })
                }else{
                    // update the sourceLimit
                    customUserExists.sourceLimit += 1;
                    await customUserExists.save();
                }
                console.log("Successfully updated customUser");
            }else{
                // create qdrantCollection 
                const qdrantCollection = `user_${userId}`
                console.log("qdrantCollection:",qdrantCollection);
                
                await customUserModel.create({
                    userId,
                    sourceLimit:1,
                    qdrantCollection
                })
            }    
            console.log("Successfully created customUser");
                    
        } catch (error) {
            return res.status(500).json({
                success:false,
                message:"Something went wrong"
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
        if (file.size > 15728640) {
            res.status(400).json({
                success: false,
                message: "File should be lower than 15mb"
            })
        }
        console.log("got the file and Size ", file.size);
        const fileSize = file.size

        // validate file type
        // pending-----------------

        console.log("Uploading to cloudinary");

        const filePath = req.file?.path;
        if (!filePath) {
            // console.log("No file path found 1");

            throw new Error("No file path found")
        }

        console.log("-----------------------", filePath);

        const uploadedFile = await uploadOnCloudinary(filePath)

        if (!uploadedFile) {
            throw new Error("File required")
        }
        console.log("Uploaded to cloudinary:", uploadedFile);

        const fileSaved = await fileModel.create({
            userId,
            name: file.originalname,
            diskName: file.filename,
            fileType: file.mimetype,
            fileSize: file.size,
            url: (uploadedFile as any).secure_url,
            publicId: (uploadedFile as any).public_id,
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
            qdrantCollection:`user_${userId}`,
            filePath,
            fileSize
        }, { removeOnComplete: true, removeOnFail: true })

        console.log(`Job added to the queue ${job}`);


        // removing the file from disk after being processed
        // fs.unlinkSync(filePath);
        // console.log("Temp file deleted:", filePath);


        return res.status(200).json({
            success: true,
            message: "File uploaded successfully",
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
            error: "Upload failed",
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

        if (!allFiles || allFiles.length === 0) {
            return res.status(200).json({
                success: false,
                files: [],
                message: "No files uploaded"
            })
        }
        return res.status(200).json({
            success: true,
            files: allFiles
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
        const { id } = req.params;
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
