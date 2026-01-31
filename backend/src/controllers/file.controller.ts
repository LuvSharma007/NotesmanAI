import fileModel from "../models/file.model.js";
import { Request, Response } from "express";
import {uploadOnCloudinary} from "../lib/cloudinary.js";
import { fileProcessingQueue } from "../bullmq/queues/upload.queue.js";
import mongoose from "mongoose";
import { deleteFileQueue } from "../bullmq/queues/delete.queue.js";


export const uploadFile = async(req:Request,res:Response)=>{
    try {
        console.log("Controller runned");
        
        const file = req.file;
        
        
        if(!file){
            return res.status(400).json({
                success:false,  
                error:"No file Provided"
            })
        }
        if(file.size > 15728640){
            res.status(400).json({
                success:false,
                message:"File should be lower than 15mb"
            })
        }
        console.log("got the file and Size ",file.size);
        const fileSize = file.size
        
        // validate file type
        // pending-----------------
        
        console.log("Uploading to cloudinary");
        
        const filePath = req.file?.path;
        if(!filePath){
            // console.log("No file path found 1");
            
            throw new Error("No file path found")
        }

        console.log("-----------------------",filePath);        

        const uploadedFile = await uploadOnCloudinary(filePath)
               
        if(!uploadedFile){
            throw new Error("File required")
        }
        console.log("Uploaded to cloudinary:",uploadedFile);        

        const userId = (req as any).user.id
        const qdrantCollection = `user_${userId}_${file.originalname}}`

        
        const fileSaved = await fileModel.create({
            userId,
            fileName:file.originalname,
            diskName:file.filename,
            fileType:file.mimetype,
            fileSize:file.size,
            url:(uploadedFile as any).secure_url,
            publicId:(uploadedFile as any).public_id,
            qdrantCollection            
        })


        if(!fileSaved){
            return res.status(400).json({
                success:false,
                error:"No file saved"
            })
        }

        console.log("File saved mongoDB",fileSaved);

        // // add a job to the queue
        console.log("Adding job to processing queue...");

        await fileModel.findByIdAndUpdate(fileSaved._id,{status:"processing"})

        const job = await fileProcessingQueue.add("file-processing-queue",{
            fileId: fileSaved._id.toString(),
            fileUrl: (fileSaved as any).url,
            fileName: fileSaved.fileName,
            diskName:fileSaved.diskName,
            fileType: fileSaved.fileType,
            publicId:fileSaved.publicId,
            userId,
            qdrantCollection,
            filePath,
            fileSize
        },{removeOnComplete:true,removeOnFail:true})

        console.log(`Job added to the queue ${job}`);
        

        // removing the file from disk after being processed
        // fs.unlinkSync(filePath);
        // console.log("Temp file deleted:", filePath);
        

        res.status(200).json({
            success: true,
            message: "File uploaded successfully",
            file: {
                id: fileSaved._id.toString(),
                name: fileSaved.fileName,
                url: fileSaved.url,
                type: fileSaved.fileType,
                size: fileSaved.fileSize,
            },
    })
    } catch (error) {
        console.error("Error uploading file:",error);
        res.status(500).json({
            success:false,
            error:"Upload failed",
            details:(error as Error).message
        })
    }   
}

export const getAllFiles = async(req:Request,res:Response)=>{
    try {
        const userId = (req as any).user.id

        const allFiles = await fileModel
            .find({ userId, status: { $nin: ["deleting", "deleted"] } })
            .sort({ createdAt: -1 });

        if(!allFiles || allFiles.length === 0){
            return res.status(200).json({
                success:false,
                files:[],
                message:"No files uploaded"
            })
        }
        return res.status(200).json({
            success:true,
            files:allFiles
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

export const deleteFile = async(req:Request,res:Response)=>{
    try {
        const userId = (req as any).user.id;
        const {fileId} = req.params;

        const fileUpdated = await fileModel.findOneAndUpdate({_id:fileId,userId},{status:"deleting"},{new:true})
        console.log("file status updated:",fileUpdated);
        

        if(!mongoose.Types.ObjectId.isValid(fileId)){ 
            return res.status(400).json({success:false,message:"Invalid file ID"});
        }

        const file = await fileModel.findOne({_id:fileId,userId});
        if(!file){
            return res.status(404).json({success:false,message:"File not found"})
        }

        const deletionJob = await deleteFileQueue.add('delete-file-queue',{
            fileId:file.id,
            userId:file.userId,
            publicId:file.publicId,
            qdrantCollection:file.qdrantCollection
        },{removeOnComplete:true,removeOnFail:true})

        console.log(`Job added to the queue ${deletionJob}`);

        
        return res.status(200).json({success:true,message:"File deleted"})
        
    } catch (error) {
        console.error("Error deleting file:",error);
        res.status(500).json({success:false,message:"File Deletion Error"})
    }
}
