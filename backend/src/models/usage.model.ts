import mongoose, { Model, Schema , Document } from "mongoose"

export interface IUsage extends Document {
    userId: mongoose.Types.ObjectId,
    tokens:number,
    query: number,
    chatIds: mongoose.Types.ObjectId[],
    hasSubscription:boolean,
    isPro:boolean,
    shouldShowWarning:boolean,
}

const usageSchema: Schema<IUsage> = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        unique: true
    },
    tokens: {
        type: Number,
        required: true,
        default: 0
    },
    query: {
        type: Number,
        required: true,
        default: 0,
    },
    chatIds: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "conversation",
        required: true,
        default: [],
        validate: [chatLimit, '{PATH} exceeds the limit of 100']
    },
    hasSubscription:{
        type:Boolean,
        default:false
    },
    isPro:{
        type:Boolean,
        default:false
    },
    shouldShowWarning:{
        type:Boolean,
        default:false,
    }
},
    { timestamps: { createdAt: true, updatedAt: true } }
)

function chatLimit(val: mongoose.Types.ObjectId[]): boolean {
    return val.length <= 100;
}

const usageModel: Model<IUsage> = mongoose.model("usage", usageSchema)
export default usageModel;