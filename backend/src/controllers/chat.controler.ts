import { Request, Response } from "express";
import { createAgent } from "langchain";
import fileModel from "../models/file.model.js";
import { getContext } from "../agents/tools/getContextTool.js";
import { z } from 'zod'
import { messageQueue } from "../bullmq/queues/message.queue.js";
import {getConversation} from "../agents/tools/getConversation.js";
import urlModel from "../models/url.model.js";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");


const SYSTEM_PROMPT = `You're an Expert AI Assistent at answer the user question based on the available context.
user can upload the documents like PDF,Docx,Txt.
Your task is to provide accurate answer from the documents context to the user and provide the summary of the document along with page numbers references.

You have two Tools:
1.) getConversation: which returns the summary if the conversation between AI and user.
2.) getContext : which returns the most relevent information from the vector DB for the user question.

Guidelines:
- first always call the getconversation tool to get some context about the conversation going on between AI and user.
- If no summary is found make sure you don't say no summary for user and AI is not found.
- second always call the getContext tool to get some context about the user's question. 
- Do not call tools again and again or more than ones.
- wait for both tools to return data , then generate the response.
- Extract the relevant information from getContext based on the user question.
- If no relevant information is found just politely say no and provide a general response.
- then after extracting the summary of conversation and context about the user's question , generate the final response.
- do not include the summary in the final response. instead use it to get a idea about the user's query.

Rules:
1.) use conversationSummary as only conversation context.
2.) use the data from both tools and then provide the general answer.
3.) always call getConversation tool before getContext tool to aware about the conversation context.
4.) Do not include the summarised conversation in the final answer.
6.) understand the user query if the user is asking some questions try to call the getContext Tool to get some context about the user's query
7.) If the user is causally talking to you like , hi , hey , hello , how are you , who are you , don't call the tool unnecessary , first undertand what is the user's question.
8.) Do not repeat or echo the full context from tool back to the user.

Important:
1.) the user should never see the conversation summary. do not include it the response.
2.) Do not call both tools more than ones.
3.) Do not include works like conversation summary in final response.
`

// const getConversationTask = task("getConversation",async(params: {
//   userId:string;
//   fileId:string;
// }):Promise<{conversationSummary:string}> =>{
//   console.log("Running getConversation task");
//   const result = await getConversation.invoke(
//     {},
//     { context:{userId:params.userId,fileId:params.fileId}}
//   )
//   console.log("getConversation task completed");
//   return {conversationSummary:result as unknown as string}
// })

// const getContextTask = task("getContext",async(params:{
//   userId:string;
//   fileId:string;
//   qdrantCollectionName:string;
//   query:string
// })=>{
//   console.log("Running getContext task");
//   const result = await getContext.invoke(
//     {query:params.query},
//     {context:{userId:params.userId,fileId:params.fileId,qdrantCollectionName:params.qdrantCollectionName}}
//   )
//   console.log("getContext task completed");
//   return {context:result as string}
// } )

// const generateResponseTask = task(
//   "generateResponse",
//   async (params: {
//     conversationSummary: string;
//     documentContext: string;
//     query: string;
//   }): Promise<string> => {
//     console.log("Generating final response...");
    
//     const prompt = `User Question: ${params.query}

// Conversation History: ${params.conversationSummary}
// Document Context: ${params.documentContext}

// Answer the user's question using the conversation history and document context above. 
// Do NOT include the conversation history or document context in your response.
// Focus on answering the current question concisely.`;

//     const model = new ChatOpenAI({ model: "gpt-4-turbo-mini" });
//     const response = await model.invoke(prompt);
//     return response.content as string;
//   }
// );


// const parallelWorkflow = entrypoint(
//   "chatWorkflow",
//   async(params:{
//     userId:string,
//     fileId:string;
//     qdrantCollectionName:string
//     query:string
//   })=>{
//     console.log("Starting parallel workflow");

//     const [conversationResult,contextResult] = await Promise.all([
//       getConversationTask({userId:params.userId,fileId:params.fileId}),
//       getContextTask(params),
//     ])

//     // generate final response
//     const finalResponse = await generateResponseTask({
//         conversationSummary:conversationResult.conversationSummary,
//         documentContext:contextResult.context,
//         query:params.query
//     })

//     return finalResponse;    
//   }
// )


export const chat = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { query, id ,sourceType} = req.body;
    console.log("Id:",id);
    console.log("SourceType:",sourceType);    
    console.log("Query:",query);
    

    if (!query || !id || !userId || !sourceType) {
      return res.status(404).json({ message: "Missing required fields" });
    }
    if(!["file","url"].includes(sourceType)){
      return res.status(400).json({message:"Invalid sourceType"})
    }

    let source;

    if(sourceType === "file"){
      source = await fileModel.findOne({ _id: id, userId });
    }else{
      source = await urlModel.findOne({_id:id,userId})
    }
    if (!source) {
      return res.status(404).json({ message: "Source not found" });
    }

    const qdrantCollectionName = source.qdrantCollection;

    const agent = createAgent({
      model: "gpt-4.1-nano",
      tools: [getContext,getConversation],
      // middleware: [parallelContextLoaderMiddleware],
      description: `You are an AI Expert Agent that give answer based on the available context.`,
      contextSchema: z.object({
        qdrantCollectionName: z.string(),
        userId: objectIdSchema,
        id: objectIdSchema,
        conversationSummary: z.string().optional()
      })
    });
    
    // console.log(
    //   await agent.invoke(
    //   {messages:[{role:"user",content:query}]},
    //   {context:{qdrantCollectionName,fileId,userId}}
    // )
    // )


    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.flushHeaders?.();


    const stream = await agent.stream(
      {
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: query },
        ],
      },
      {
        streamMode:"messages",
        context: {
          qdrantCollectionName, userId, id
        },
      }
    );

    // for await (const chunk of stream){
    //   console.log("chunks:",chunk);
    // }

  let aiResponse = "";
    for await (const chunk of stream) {
      const messageChunk = chunk?.[0];   // contains .content
      const meta = chunk?.[1];           // contains langgraph_node

      // Only allow model_request text
      if (meta?.langgraph_node === "model_request" && typeof messageChunk?.content === "string") {
        aiResponse += messageChunk.content;
        res.write(messageChunk.content);
      }
    }

    console.log("aiResponse:", aiResponse);

    res.end();

    // Starting worker
    console.log("Adding job to processing queue");

    const job = await messageQueue.add("save-message-queue", {
      userId,
      id,
      name: source.name,
      sourceType,
      userMessage: query,
      aiMessage: aiResponse
    },{removeOnComplete:true,removeOnFail:true})

    console.log(`Job added to the queue ${job}`);


  } catch (error) {
    console.error("Error in chat controller", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal server error" });
    } else {
      res.end();
    }
  }
};
