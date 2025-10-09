import express from 'express'
import { upload } from '../middlewares/upload.js';
import { uploadTOCloudinary } from '../services/fileUpload.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';


const router = express.Router();

router.post("/upload", isAuthenticated , upload.single("file"),async(req,res)=>{
    try {
        const file = req.file;
        if(!file){
            return res.status(400).json({error:"No file provided"});
        }
        const result = await uploadTOCloudinary(file)
        res.json({url:(result as any).secure_url});
    } catch (error) {
        res.status(500).json({error:"Upload failed",details:error})
    }
})

export default router;
 
