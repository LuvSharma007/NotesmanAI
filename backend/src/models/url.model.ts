import mongoose, { Model, Schema } from "mongoose"
import { isArray } from "util";
import { lowercase } from "zod";

interface IUrlItem {
    link:string,
    name:string
}

export interface IUrl extends Document{
    userId:mongoose.Types.ObjectId,
    urls:IUrlItem[],
    status:string,
    name:string,
    createdAt:string,
    sourceType:string
}

const urlSchema:Schema<IUrl> = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    urls: {
        type: [{
            link:{type:String,trim:true,lowercase:true,required:true},
            name:{type:String,trim:true,required:true},
        }],
        required: [true, "You must provide at least one URL"],
        validate: {
            validator: function (v: any[]) {
                return Array.isArray(v) && v.length > 0;
            },
            message: "You must provide at least one URL"
        }
    },
    sourceType:{
        type:String,
        default:"url"
    },
    status:{
        type:String,
        enum:['pending','chunking', 'processing' ,'completed','failed',],
        default:'pending'
    }
},
{timestamps:{createdAt:true,updated:false}}
)

const urlModel:Model<IUrl> = mongoose.model("url",urlSchema)
export default urlModel;