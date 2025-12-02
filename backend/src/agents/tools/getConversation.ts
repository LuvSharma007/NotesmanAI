import { tool } from "langchain";
import z from "zod";
import { conversationQueue ,conversationQueueEvents} from "../../bullmq/queues/conversation.queue.js";
import { ChatOpenAI } from "@langchain/openai";

export const getConversation = tool(
    async({},config)=>{
        console.log("get conversation tool called");
        
        const {userId,fileId} = config.context;

        const job = await conversationQueue.add("get-conversation",{
            userId,
            fileId
        });

        const messages = await job.waitUntilFinished(conversationQueueEvents);
        console.log("Messages from redis",messages);

        const summarizer = new ChatOpenAI({
            model:'gpt-4.1-mini',
            temperature:0,
        })

        const summaryResult = await summarizer.invoke([
            {
                role:"user",
                content:`Summarize the user and AI chat , Do not include any timestamps , do not add anything from yourself extra.
                Messages:${messages}`
            }
        ])

        const summary = summaryResult.content
        console.log("Summary of Conversation:",summary);

        return {summary:`[INTERNAL CONTEXT - DO NOT DISPLAY TO USER ]\n ${summary}`};
        

        // return typeof summary === "string" 
        //     ? `[Previous conversation context loaded]` 
        //     : "No previous conversation";
        
    },
    {
        name:"get-conversation",
        description:"Returns the summarized AI and user conversation to agent",
        schema:z.object({})
    }
)




