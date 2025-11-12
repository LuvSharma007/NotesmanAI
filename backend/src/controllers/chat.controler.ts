import { Request, Response } from "express";
import { createAgent , summarizationMiddleware } from "langchain";
import fileModel from "../models/file.model.js";
import { getContext } from "../agents/tools/getContextTool.js";
import { z } from 'zod'
import { checkpointer } from "../db/client.js";
import { ChatOpenAI } from "@langchain/openai";

const SYSTEM_PROMPT=`You're an AI Assistent that answer the user query based on the available context from the files.
You always answer the from the context to the query.
Rules:
1.) First understand the user query if the user is asking some questions try to call the getContext Tool to get some context about the user's query
if you did not get the revlant data from the vector DB. politely say i don't find any revlant data related to your query.
2.) If the user is causally talking to you like , hi , hey , hello , how are you , who are you , don't call the tool unnecessary , first undertand what is the user's question. 
3.) Also tell the user about the page number from the documents.
4.) Always get the context about the query and then formulate your answer.
5.) Do not repeat or echo the full context from tool back to the user.
`

const summaryModel = new ChatOpenAI({model:'gpt-4.1-nano'});

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
      tools: [getContext],
      checkpointer,
      description: `You're an AI agent that gave answers based on the avilable context.`,
      contextSchema: z.object({
        qdrantCollectionName: z.string()
      })
    });

      // console.log(
      //   await agent.invoke(
      //   {messages:[{role:"user",content:query}]},
      //   {context:{qdrantCollectionName}}
      // )
      // )
    
    
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.flushHeaders?.();

    
    

    const stream = await agent.stream(
      {
        messages: [
          {role:"system",content:SYSTEM_PROMPT},
          { role: "user", content: query },
        ],
      },
      {
        streamMode: "messages",
        context: { 
          qdrantCollectionName,
         },
        configurable:{thread_id:`${userId}_${fileId}`}
      }
    );

  for await (const chunk of stream) {
  if (Array.isArray(chunk)) {
    for (const c of chunk) {
      if (c.constructor.name === 'ToolMessage') continue;
      
      if (c.content && typeof c.content === "string") {
        res.write(c.content);
      }
    }
  }
}
        
    res.end()

  } catch (error) {
    console.error("Error in chat controller", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal server error" });
    } else {
      res.end();
    }
  }
};