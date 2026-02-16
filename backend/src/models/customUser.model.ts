import mongoose, { Model, Schema } from "mongoose";

export interface ICustomUser extends Document{
    userId:mongoose.Types.ObjectId;
    sourceLimit:number,
    qdrantCollection:string
}

const customUserSchema:Schema<ICustomUser> = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"user",
        required:true,
    },
    sourceLimit:{
        type:Number,
        max:3,
        default:0
    },
    qdrantCollection:{
        type:String,
        required:false,
        unique:true
    }
},{timestamps:{createdAt:true,updated:false}})

const customUserModel:Model<ICustomUser> = mongoose.model("customUser",customUserSchema)
export default customUserModel;

