import mongoose, { Model, Schema } from "mongoose";

export interface IFile extends Document{
    userId:mongoose.Types.ObjectId;
    name:string
    diskName:string
    fileType:"pdf" | "docx" | "txt" | string
    fileSize:string
    qdrantCollection:string
    url:string
    publicId:string
    status:string
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
        enum:['pending','processing','completed','failed','deleting'],
        default:'pending'
    }
})

const fileModel:Model<IFile> = mongoose.model("file",fileSchema)
export default fileModel;