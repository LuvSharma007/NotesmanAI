import { uploadTOCloudinary } from "../services/fileUpload.js"
import fileModel from "../models/file.model.js";
import { Request, Response } from "express";

export const uploadFile = async(req:Request,res:Response)=>{
    try {
        const file = req.file;

        if(!file){
            return res.status(400).json({
                success:false,
                error:"No file Provided"
            })
        }
        console.log("File:",file);
        console.log("Uploading to cloudinary.....");
        
        const result = await uploadTOCloudinary(file);
        console.log("Uploaded to cloudinary:",result);

        const fileSaved = await fileModel.create({
            userId:(req as any).user.id,
            fileName:file.originalname,
            fileType:file.mimetype,
            fileSize:file.size,
            url:(result as any).secure_url,
            publicId:(result as any).publicId
        })

        if(!fileSaved){
            return res.status(400).json({
                success:false,
                error:"No file saved"
            })
        }

        console.log("File saved mongoDB",fileSaved);
        

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
}