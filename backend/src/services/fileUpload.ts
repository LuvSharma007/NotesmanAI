import {v2 as cloudinary} from "cloudinary"
import streamifier from 'streamifier'

console.log("cloud_name:",process.env.CLOUDINARY_CLOUD_NAME);
console.log("api_key:",process.env.CLOUDINARY_API_KEY);
console.log("api_secret:",process.env.CLOUDINARY_SECRET_KEY);

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_SECRET_KEY
})

export const uploadTOCloudinary = (file:Express.Multer.File)=>{
    return new Promise((resolve,reject)=>{
        const stream = cloudinary.uploader.upload_stream({folder:"uploads"},(err,result)=>{
            if(err)return reject(err);
            resolve(result)
        });
        console.log("File stream",stream);
        
        streamifier.createReadStream(file.buffer).pipe(stream)
    })
}