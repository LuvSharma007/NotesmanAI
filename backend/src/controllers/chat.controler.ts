import { Request, Response } from "express";
import { createAgent, createMiddleware } from "langchain";
import fileModel from "../models/file.model.js";
import { getContext } from "../agents/tools/getContextTool.js";
import { z } from 'zod'
import { messageQueue } from "../bullmq/queues/message.queue.js";
import { getConversation } from "../agents/tools/getConversation.js";



const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

// const conversationLoaderMiddleware = createMiddleware({
//   name: "ConversationLoader",
//   contextSchema: z.object({
//     userId: objectIdSchema,
//     fileId: objectIdSchema,
//   }),
//   beforeAgent: async (state, runtime) => {
//     const userId = runtime.context?.userId;
//     const fileId = runtime.context?.fileId;

//     console.log("Running conversation middleware in parallel");

//     if (!userId || !fileId) {
//       console.log("Missing context data");
//       return null;
//     }

//     try {
//       console.log("Messages",state.messages);
      

//       let conversationSummary = await getConversation.invoke({}, {
//         context: { userId, fileId }
//       });

// //       const updatedMessages = [
// //         {
// //           role: "system",
// //           content: `${SYSTEM_PROMPT}

// // FOR CONTEXT ONLY (DO NOT SHOW IN ANSWER):
// // Previous Conversation Summary:
// // ${conversationSummary || "No previous conversation"}`,
// //           ...state.messages.slice(1),
// //         },
// //       ];

//       return {
//         context: {
//           conversationSummary
//         }
//       };

//     } catch (error) {
//       console.error("Error in middleware", error)
//       return null;
//     }
//   }
// })


const SYSTEM_PROMPT = `You're an Expert AI Assistent at answer the user question based on the available context.
user can upload the documents like PDF,Docx,Txt.
Your task is to provide accurate answer from the documents context to the user.

You have two Tools:
1.) getConversation: which returns the summary if the conversation between AI and user.
2.) getContext : which returns the most relevent information from the vector DB for the user question.

Guidelines:
- Use the conversation summary to enhance the user experience.
- If no summary is found make sure you don't say summary oo user and AI is not found.
- the is only for your understanding , do not include it in your response.
- Extract the relevant information from getContext based on the user question.
- If no relevant information is found just politely say no and provide a general response.
- do not include the summary in the final response. instead use it to get a idea about the user's query.
- wait for both tools to return data , then generate the response.

Rules:
1.) use conversationSummary as only conversation context.
2.) use the data from both tools and then provide the general answer.
3.) always call getConversation tool before getContext tool to aware about the conversation context.
4.) Do not include the summarised conversation in the final answer.
6.) understand the user query if the user is asking some questions try to call the getContext Tool to get some context about the user's query
7.) If the user is causally talking to you like , hi , hey , hello , how are you , who are you , don't call the tool unnecessary , first undertand what is the user's question.
8.) Do not repeat or echo the full context from tool back to the user.

Important:"the user should never see the conversation summary. do not include it the response "

`
export const chat = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { query, fileId } = req.body;

    if (!query || !fileId || !userId) {
      return res.status(404).json({ message: "No query found" });
    }

    const file = await fileModel.findOne({ _id: fileId, userId });
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const qdrantCollectionName = file.qdrantCollection;

    const agent = createAgent({
      model: "gpt-4.1-nano",
      tools: [getContext,getConversation],
      // middleware: [conversationLoaderMiddleware],
      description: `${SYSTEM_PROMPT}`,
      contextSchema: z.object({
        qdrantCollectionName: z.string(),
        userId: objectIdSchema,
        fileId: objectIdSchema,
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
        streamMode:"values",
        context: {
          qdrantCollectionName, userId, fileId,
        },
      }
    );
    let aiResponse = "";
    
for await (const chunk of stream) {
  const latestMessage = chunk.messages?.at(-1);

  if (
    latestMessage?.constructor.name === 'AIMessage' &&
    latestMessage.content &&
    typeof latestMessage.content === "string" &&
    (!latestMessage.tool_calls || latestMessage.tool_calls.length === 0)
  ) {
    aiResponse += latestMessage.content;
    res.write(latestMessage.content);
  }
}
  
  console.log("aiResponse:", aiResponse);


    res.end();

    // Starting worker
    console.log("Adding job to processing queue");

    const job = await messageQueue.add("save-message", {
      userId,
      fileId,
      fileName: file.fileName,
      userMessage: query,
      aiMessage: aiResponse
    })

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