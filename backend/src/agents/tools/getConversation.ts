import z from "zod";
import { conversationQueue ,conversationQueueEvents} from "../../bullmq/queues/conversation.queue.js";
import { tool } from "@openai/agents";
import {openai} from "../../lib/openAIClient.js"

export const getConversation = tool({
    name:"get_conversation",
    description:"Returns the summarized AI and user conversation to agent",
    parameters:z.object({}),
    async execute(_,toolContext:any){
        console.log("getConvertsation tool called");
        const {id,userId} = toolContext.context
        if(!id){
            throw new Error("id not found")
        }
        if(!userId){
            throw new Error("userId not found")
        }

        const job = await conversationQueue.add("get-conversation",{
            userId,
            id
        })

        const messages = await job.waitUntilFinished(conversationQueueEvents);
        console.log("messages from redis",messages);

        const response = await openai.chat.completions.create({
            model:"gpt-4.1-mini",
            messages:[
                messages,
                {role:"user",content:"Summarize the user and AI chat , Do not include any timestamps , do not add anything from yourself extra.",}
            ]
        })
        console.log("SummaryResult:",response.choices[0].message.content);

        return {conversationSummary:response.choices[0].message.content as string};     
    }
})







