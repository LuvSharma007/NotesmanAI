import express from 'express'
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import { deleteFile,getAllFiles, uploadFile } from '../controllers/file.controller.js';


const router = express.Router();

router.post("/upload", isAuthenticated , upload.single("file"),uploadFile)
router.get("/get-files",isAuthenticated,getAllFiles)
router.delete("/delete-file/:id",isAuthenticated,deleteFile)

export default router;
 
