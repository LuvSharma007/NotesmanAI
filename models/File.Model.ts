import mongoose, { Model, Schema } from "mongoose";

export interface IFile extends Document{
    userId:mongoose.Types.ObjectId;
    fileName:string;
    fileType:"pdf" | "docx" | "txt" | string;
    fileSize:string;
    uploadedAt:Date;
    qdrantCollection:string;
}

const FileSchema:Schema<IFile> = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    fileName:{
        type:String,
        required:true
    },
    fileType:{
        type:String,
        required:true,
    },
    fileSize:{
        type:String,
        required:true
    },
    uploadedAt:{
        type:Date,
        default:Date.now
    },
    qdrantCollection:{
        type:String,
        required:true
    }
    
})

const File:Model<IFile> = mongoose.models.File || mongoose.model<IFile>("File",FileSchema);

export default File;