import mongoose, { Model, Schema } from 'mongoose'

export interface IMessage extends Document{
    userId:mongoose.Types.ObjectId,
    fileId:mongoose.Types.ObjectId,
    fileName:string,
    role:"user" | "assistant",
    content:string,
}

const messageSchema:Schema<IMessage> = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    fileId:{
        type:Schema.Types.ObjectId,
        ref:"file",
        required:true
    },
    role:{
        type:String,
        enum:["user","assisstant"],
        required:true,
    },
    content:{
        type:String,
        required:true,
    },
    // fileName:{
    //     type:String,
    //     required:true
    // },
    
},
{timestamps:{createdAt:true,updatedAt:false}}
)

const messageModel:Model<IMessage> = mongoose.model("messages",messageSchema)
export default messageModel;