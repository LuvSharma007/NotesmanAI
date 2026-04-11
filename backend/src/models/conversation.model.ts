import mongoose, { Document, Model, Schema } from "mongoose";

export interface IConversation extends Document{
    userId:mongoose.Types.ObjectId,
    title:string,
    sources:{
        sourceId:mongoose.Types.ObjectId;
        sourceType:"file" | "url"
    }[],
    deletedAt: Date | null
}

const conversationSchema:Schema<IConversation> = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'user',
        required:true,
        index:true
    },
    title:{
        type:String,
    },
    sources:[{
        sourceId:{
            type:mongoose.Types.ObjectId,
            required:true
        },
        sourceType:{
            type:String,
            enum:['file',"url"],
            required:true
        },
        _id:false
    }],
    deletedAt:{
        type:Date,
        default:null,
        index:true
    }
},{timestamps:{createdAt:true,updatedAt:true}})

const conversationModel:Model<IConversation> = mongoose.model("conversation",conversationSchema)
export default conversationModel;