import mongoose, { Model } from "mongoose";

export interface IMessage extends Document {
  userId: mongoose.Types.ObjectId;  // who owns the chat
  fileId?: mongoose.Types.ObjectId; // optional: message tied to a file
  role: "user" | "assistant" | "system"; // role in the conversation
  content: string; // actual message
  createdAt: Date;
}


const messageSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    fileId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'file'
    },
    role:{
        type:String,
        enum:["System","user","assistant"],
        required:true
    },
    content:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
})

const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema);

export default Message;