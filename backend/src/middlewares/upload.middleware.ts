import multer from "multer"
import fs from 'fs'

export const allowedMimeTypes = [
  'application/pdf',
  'text/plains',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword' // For older .doc files
]

export interface CloudinaryResponse {
  public_id: string,
  secure_url: string,
  [key:string]:any
}

const uploadDir = "./public/temp";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname.trim())
  },
})

export const upload = multer({ storage: storage })