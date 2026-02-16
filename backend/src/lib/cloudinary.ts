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
            throw new Error("No file path found")
        }
        
        
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"raw",
            folder:'notesman-fullstack',
            use_filename:true,
            overwrite:false,   
            timeout:60000 
            // type:'authenticated'     
        })
        

        
        console.log("File has been uploaded to cloudinary:",response);
        return response;
        
    } catch (error) {
        fs.unlinkSync(localFilePath)
        console.log("Error:",error);        
        throw new Error("Error uploading file")
    }
}

export {
    uploadOnCloudinary
};
