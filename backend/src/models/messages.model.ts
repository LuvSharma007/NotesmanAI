import mongoose, { Model, Schema } from 'mongoose'

export interface IMessage extends Document{
    userId:mongoose.Types.ObjectId,
    id:mongoose.Types.ObjectId,
    name:string,
    role:"user" | "assistant",
    content:string,
    sourceType:"file"|"url"
}

const messageSchema:Schema<IMessage> = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    id:{
        type:Schema.Types.ObjectId,
        refPath:'linkModel',
        required:true
    },
    sourceType:{
        type:String,
        required:true,
        enum:['file','url']
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
    // name:{
    //     type:String,
    //     required:true
    // },
    
},
{timestamps:{createdAt:true,updatedAt:false}}
)

const messageModel:Model<IMessage> = mongoose.model("messages",messageSchema)
export default messageModel;