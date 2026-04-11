import mongoose, { Model, Schema } from "mongoose"

export interface IUsage extends Document{
    userId:mongoose.Types.ObjectId,
    tokens:number,
    query:number,
    createdAt:string,
}

const usageSchema:Schema<IUsage> = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    tokens:{
        type:Number,
        required:true,
        max:10000
    },
    query:{
        type:Number,
        required:true,
        max:100
    }
},
{timestamps:{createdAt:true,updatedAt:false}}
)

const usageModel:Model<IUsage> = mongoose.model("usage",usageSchema)
export default usageModel;