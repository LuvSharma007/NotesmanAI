import express from 'express'
import { upload } from '../middlewares/upload.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { uploadFile } from '../controllers/file.controller.js';


const router = express.Router();

router.post("/upload", isAuthenticated , upload.single("file"),uploadFile)

export default router;
 
