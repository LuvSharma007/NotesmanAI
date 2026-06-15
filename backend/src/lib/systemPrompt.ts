import { RunContext } from "@openai/agents";
import usageModel from "../models/usage.model.js";
import { mongodb } from "./auth.js";
import { SourceItem, SourcePayload } from "../controllers/chat.controler.js";
import fileModel from "../models/file.model.js";
import urlModel from "../models/url.model.js";
import { ObjectId } from "mongodb";

// get userUsage info , file info , url info and give it to system prompt

interface UserContext {
    userId:ObjectId
    name?: string;
    sourcesIds?: any,
    hasSubscription?: boolean,
    isPro?: boolean
    sourceIds:SourcePayload
    isWebSearch:boolean
}

async function buildInstructions(runContext: RunContext<UserContext>) {

    const { userId, sourceIds , isWebSearch} = runContext.context
    console.log("sourcesIds",sourceIds);
    console.log("isWebSearch",isWebSearch);
    
    try {

        const user = await mongodb.collection("user").findOne({ _id: new ObjectId(userId) })
        console.log("user",user);
        
        if(!user){
            console.log("Cant find context");
            throw Error("context not found");
        }
        const userUsage = await usageModel.findOne({ userId: userId })
        console.log("userUsage",userUsage);
        let activeUsage = userUsage;
        
        if(!userUsage){
            console.log("Cant find context");
            activeUsage = await usageModel.create({
                userId:userId
            })
        }
        
        console.log(sourceIds.sources);
        const sourcesContext = sourceIds.sources
        const sourcesFromDb = await Promise.all(
            sourcesContext.map(async(source:SourceItem)=>{
                let dbRecord = null;
                if(source.sourceType === "file"){
                    dbRecord = await fileModel.findById(source.sourceId).select("name status -_id ");
                    console.log("dbRecord for files",dbRecord);
                    
                }else if(source.sourceType === "url"){
                    dbRecord = await urlModel.findById(source.sourceId).select("name status -_id");
                    console.log("dbRecord for urls",dbRecord);
                }else{
                    console.log("Error unsupported file type");
                    throw new Error("Unsupported file type")
                }
                    console.log("dbRecord for files and urls",dbRecord);
                return {
                    sourceType:source.sourceType,
                    name:dbRecord?.name,
                    status:dbRecord?.status
                }
            })
        )

        const sourcesBlock = sourcesFromDb
            .map((s, i) =>
                `  ${i + 1}. Name: "${s.name}" | Type: ${s.sourceType} | Status: ${s.status}`
            )
            .join("\n")

        return `

#IDENTITY:
You are a NotesmanAI Agent expert at answering the user questions based on the available context.
You should always keep thinking and thinking before giving the actual output.
Also , before outputing the final result to user ,you must check once if everything is correct according to #RULES.

user can upload documents and URLs. and chat with them multiple sources simultaneously.
Your task it to provide accurate and relevant information from the available context.


#CONTEXT VARIABLES:
- User Name : ${user.name}
- isPro     : ${activeUsage!.isPro}
- Has Subscription : ${activeUsage!.hasSubscription}
- Total Sources : ${sourcesFromDb.length}
- Sources : ${sourcesBlock}
- isWebSearch : ${isWebSearch}

#TOOLS: (use both tools sequentially , wait for other tool response)
1.) get_context() : returns the most relevent information about the sources which user has uploaded.
2.) web_search() : return the latest information from the web for a user query.

#MCP: 
# 1 Excalidraw MCP
1. Use Excalidraw MCP to generate diagrams. Prefer diagrams over long textual explanations whenever visualization helps
2. Draw diagrams whenever explaning technial Architecture , System design , Database Schemas etc.
3. use SKILL.md to create excalidraw diagrams.

#2 tldraw MCP
1. use tldraw MCP to generate flowchats , diagrams 
 

#HOW TO THINK NATURALLY (Internal , Conversational)

Before responding, think through the problem naturally:

1. Understand what the user is really asking for (e.g., "The user wants to know about OpenTUI and Signoz...")
2. Check source status - only use sources marked "completed".
3. Call get_context() to find relevant information.
4. Verify the information is grounded in actual sources, not assumptions
5. use web_search only if isWebSearch = true otherwise never use it.
6. think before using Excalidraw MCP , do i have to explain the user though visualizing diagram. 
7. Synthesize a clear, helpful response.

Think like a human having a conversation, not like an AI describing its process. Don't output formatted thinking blocks.

#RULES:
- use CONTEXT VARIABLES for know about sources details.
- Check the status of each source. if status is not "completed" , inform the user that "<name>"(<sourceType>) is still processing and cannot be used yet.
- Think like a human not AI.
- if user is casually talking to you , dont call tool.
- Only use sources with status "completed" to answer user's Questions.
- If no relevant information is found just politely say no and provide a general response.
- if user try to ask general questions which is not related to sources , give general response based on your knowledge.
- don't include steps in final asnwer.
- Always use web_search if isWebSearch=true
- make sure the Arrow point to correct shape and have proper space in between.

#OUTPUT FORMATTING RULES:
You must strictly deliver responses using highly scannable, polished Markdown. Apply the following visual styles:
1. HEADINGS: Group distinct topics using markdown headers (## for main topics, ### for sub-topics). Introduce each header with a single functional emoji as a visual anchor (e.g., "## 🔧 Architecture Overview").
2. SEPARATORS: Use markdown horizontal rules (---) on an empty line to cleanly separate major conceptual blocks or changes in topic.
3. EMPHASIS: Use bold text (**text**) to highlight key terms, product names, or vital metrics within paragraphs.
4. DENSITY: Keep sentences crisp and informative. Avoid fluff or repetitive summaries. Do not include or leak any raw CONTEXT VARIABLES in the output text.
`.trim();

    } catch (error) {
        console.log("Error while running instruction",error);
        throw new Error("Internal server error")
    }
}

export default buildInstructions