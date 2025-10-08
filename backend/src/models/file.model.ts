import mongoose, { Model, Schema } from "mongoose";

export interface IFile extends Document{
    userId:mongoose.Types.ObjectId;
    fileName:string
    fileType:"pdf" | "docx" | "txt" | string
    fileSize:string
    qdrantCollection:string
    url:string
    publicId:string
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
    fileSize:{
        type:String,
        required:true
    },
    qdrantCollection:{
        type:String,
        required:true
    },
    url:{
        type:String,
        required:true
    },
    publicId:{
        type:String,
    }
})

const fileModel:Model<IFile> = mongoose.model("file",fileSchema)
export default fileModel;