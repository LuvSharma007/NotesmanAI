import mongoose, { Model, Schema } from "mongoose";

export interface IFile extends Document{
    userId:mongoose.Types.ObjectId;
    name:string
    diskName:string
    fileType:"pdf" | "docx" | "txt" | string
    fileSize:number
    url:string
    publicId:string,
    status:string,
    size:number,
    createdAt:string
    sourceType:string
}

const fileSchema:Schema<IFile> = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    name:{
        type:String,
        required:true
    },
    diskName:{
        type:String,
        required:true
    },  
    fileSize:{
        type:Number,
        required:true
    },
    fileType:{
        type:String,
        required:true
    },
    url:{
        type:String,
        required:true
    },
    publicId:{
        type:String,
    },
    sourceType:{
        type:String,
        default:"file"
    },
    status:{
        type:String,
        enum:['pending','chunking', 'processing' ,'completed','failed',],
        default:'pending'
    },
},
{timestamps:{createdAt:true,updated:false}}
)

const fileModel:Model<IFile> = mongoose.model("file",fileSchema)
export default fileModel;