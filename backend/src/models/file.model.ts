import mongoose, { Model, Schema } from "mongoose";

export enum FileStatus{
    Pending = "pending",
    Processing = "processing",
    Done = 'done'
}

export interface IFile extends Document{
    userId:mongoose.Types.ObjectId;
    fileName:string
    diskName:string
    fileType:"pdf" | "docx" | "txt" | string
    fileSize:string
    qdrantCollection:string
    url:string
    publicId:string
    status:FileStatus
}

const fileSchema:Schema<IFile> = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    fileName:{
        type:String,
        required:true
    },
    diskName:{
        type:String,
        required:true
    },  
    fileSize:{
        type:String,
        required:true
    },
    fileType:{
        type:String,
        required:true
    },
    qdrantCollection:{
        type:String,    
    },
    url:{
        type:String,
        required:true
    },
    publicId:{
        type:String,
    },
    status:{
        type:String,
        enum:Object.values(FileStatus),
        default:FileStatus.Pending
    }
})

const fileModel:Model<IFile> = mongoose.model("file",fileSchema)
export default fileModel;