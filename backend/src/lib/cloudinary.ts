import {v2 as cloudinary} from "cloudinary"
import fs from 'fs'

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_SECRET_KEY
})

const uploadOnCloudinary = async (localFilePath: string)=>{
    try {
        if(!localFilePath){
            console.log("No file path found 1");
            
            throw new Error("No file path found")
        }
        
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"raw",
            folder:'notesman-fullstack'
        })
        
        console.log("File has been uploaded to cloudinary:",response);
        return response;
        
    } catch (error) {
        console.log("No file path found 2",error);
        fs.unlinkSync(localFilePath)
        throw new Error("Error uploading file")
    }
}

export default uploadOnCloudinary;
