
import fileModel from "../models/file.model.js";
import { Request, Response } from "express";
import uploadOnCloudinary from "../lib/cloudinary.js";

export const uploadFile = async(req:Request,res:Response)=>{
    try {
        console.log("Controller runned");
        
        const file = req.file;
        console.log("got the file",file);
        

        if(!file){
            return res.status(400).json({
                success:false,  
                error:"No file Provided"
            })
        }
        console.log("Uploading to cloudinary.....");
        
        const filePath = req.file?.path;
        if(!filePath){
            console.log("No file path found 1");
            
            throw new Error("No file path found")
        }

        const uploadedFile = await uploadOnCloudinary(filePath)

        if(!uploadFile){
            throw new Error("File required")
        }

        console.log("Uploaded to cloudinary:",uploadedFile);


        const userId = (req as any).user.id
        const qdrantCollection = `user_${userId}_${Date.now()}`

        const fileSaved = await fileModel.create({
            userId,
            fileName:file.originalname,
            fileType:file.mimetype,
            fileSize:file.size,
            url:(uploadedFile as any).secure_url,
            publicId:(uploadedFile as any).publicId,
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

        // fileProcessingQueue.add("file-processing-queue",{

        // })


        

        res.status(200).json({
            success: true,
            message: "File uploaded successfully",
            file: {
                id: fileSaved._id,
                name: fileSaved.fileName,
                url: fileSaved.url,
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
    // remove the temp file from the server
}