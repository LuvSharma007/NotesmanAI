import mongoose, { Document, Model, Schema } from 'mongoose'

export interface IMessage extends Document{
    userId:mongoose.Types.ObjectId,
    role:"user" | "assistant"
    content:string,
    conversationId:mongoose.Types.ObjectId
    reasoning?:string
    diagramData?:Record<string, any> 
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
        // required:true,  // sometimes model does reasoning sometimes dont, so i am commenting this.
    },
    conversationId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'conversation',
        required:true
    },
    reasoning:{
        type:String,
        required:false,
        default:null
    },
    diagramData:{
        type:Schema.Types.Mixed,
        required:false,
        default:null
    }
},
{timestamps:{createdAt:true,updatedAt:false}}
)

messageSchema.index({ userId: 1, conversationId: 1, createdAt: 1 });

const messageModel:Model<IMessage> = mongoose.model("messages",messageSchema)
export default messageModel;