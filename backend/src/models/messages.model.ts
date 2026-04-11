import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IMessage extends Document{
    userId:mongoose.Types.ObjectId,
    role:"user" | "assistant",
    content:string,
    conversationId:mongoose.Types.ObjectId
}

const messageSchema:Schema<IMessage> = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    role:{
        type:String,
        enum:["user","assistant"],
        required:true,
    },
    content:{
        type:String,
        required:true,
    },
    conversationId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'conversation',
        required:true
    }
    
},
{timestamps:{createdAt:true,updatedAt:false}}
)

const messageModel:Model<IMessage> = mongoose.model("messages",messageSchema)
export default messageModel;