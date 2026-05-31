import mongoose from "mongoose";
import messageModel from "../../models/messages.model.js";
import { tool } from "@openai/agents";
import z from "zod";

// export const getConversation = tool({
//     name:"get_conversation",
//     description:"Returns the summarized AI and user conversation to agent",
//     parameters:z.object({}),
//     async execute(_,toolContext:any){
//         console.log("getConversation tool called");
//         const {sourceIds,userId , finalConversationId} = toolContext.context
//         // console.log("SourcesIds",sourceIds);
//         console.log("userID",userId);
//         console.log("ConversationID",finalConversationId);

//         // if(sourceIds.length === 0){
//         //     throw new Error("id not found")
//         // }
//         if(!userId){
//             throw new Error("userId not found")
//         }

//         const messages = await messageModel.find({
//             userId,
//             conversationId:finalConversationId
//         })
//         .sort({createdAt:1})
//         .select('role content -_id')
//         .lean()
//         .limit(20)

//         console.log("messages from getConversation:",messages);
        
//         return messages     

//     }
// })

export const getConversation = async (userId:string,conversationId:mongoose.Types.ObjectId)=>{
    try {
        if(!userId || !conversationId){
            throw new Error("No Messages found for this user")
        }
        if(!userId){
            throw new Error("userId not found")
        }

        const messages = await messageModel.find({
            userId,
            conversationId
        })
        .sort({createdAt:1})
        .select('role content -_id')
        .lean()
        .limit(20)

        // console.log("messages from getConversation:",messages);
        
        return messages     
    } catch (error:any) {
        throw new Error("Error:",error)
    }
}







