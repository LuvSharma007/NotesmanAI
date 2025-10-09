import {v2 as cloudinary} from "cloudinary"
import streamifier from 'streamifier'


cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_SECRET_KEY
})

export const uploadTOCloudinary = (file:Express.Multer.File)=>{
    return new Promise((resolve,reject)=>{
        const stream = cloudinary.uploader.upload_stream({
            folder:"uploads",
            resource_type:"auto",
            timeout:120000,   //120 seconds
        },(err,result)=>{
            if(err)return reject(err);
            resolve(result)
        });
        
        streamifier.createReadStream(file.buffer).pipe(stream)
    })
}