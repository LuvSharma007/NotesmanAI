import mongoose, { Model, Schema } from "mongoose"

export interface IUrl extends Document{
    userId:mongoose.Types.ObjectId,
    url:string,
    
    name:string
}

const urlSchema:Schema<IUrl> = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    url:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    }
},
{timestamps:{createdAt:true,updated:false}}
)

const urlModel:Model<IUrl> = mongoose.model("url",urlSchema)
export default urlModel;