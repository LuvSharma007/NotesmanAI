import { Request, Response } from "express";
import { getContext } from "../agents/tools/getContextTool.js";
import { messageQueue } from "../bullmq/queues/message.queue.js";
import { getConversation } from "../agents/tools/getConversation.js";
import { Agent, AgentInputItem, FunctionTool, MCPServerStreamableHttp, run } from "@openai/agents";
import conversationModel from "../models/conversation.model.js";
import mongoose from "mongoose";
import usageModel from "../models/usage.model.js";
import { deleteChatQueue } from "../bullmq/queues/deleteChat.queue.js";
import buildInstructions from "../lib/systemPrompt.js";
import { ObjectId } from "mongodb";
import { webSearch } from "../agents/tools/webSearchTool.js";
import {z} from "zod"
import { excalidrawMCP } from "../agents/MCP/excalidrawMcp.js";
import { tldrawMCP } from "../agents/MCP/tldraw.Mcp.js";

export interface SourceItem {
  sourceId: string;
  sourceType: string;
}

export interface SourcePayload {
  sources: SourceItem[];
}

export type toolsStrucure = (FunctionTool<unknown, z.ZodObject<{
    query: z.ZodString;
}, z.core.$strip>, string> | {
    type: string;
    name: string;
    environment: {
        type: string;
        skills: {
            name: string;
            description: string;
            path: string;
        }[];
      }
  }
)[];

export type McpTool = "tldraw" | "excalidraw";
type ThinkingEffort = "none" | "minimal" | "low" | "medium" | "high" | "xhigh";
type ThinkingSummary = "auto" | "concise" | "detailed" | null | undefined;

interface RequestBody {
  query: string;
  sourceIds: SourcePayload;
  isWebSearch:boolean;
  thinkingSummary:ThinkingSummary;
  effort:ThinkingEffort;
  selectedModel:"gpt-5.5" | "gpt-5.4" | "gpt-5.4-mini" | "gpt-5.4-nano" | "gpt-4.1-mini" | "gpt-4o-mini";
  mcpSelected:McpTool[]
}

export const chat = async (req: Request, res: Response) => {
  
  try {
    const userId = (req as any).user.id;
    const { query, sourceIds , isWebSearch,effort,mcpSelected,selectedModel,thinkingSummary } = req.body as Partial<RequestBody>;
    const { conversationId } = req.params;
    const { isNewChat } = req.query;
    console.log("ConversationId:", conversationId);
    console.log("SourceIds:", sourceIds);
    console.log("isWebSearch",isWebSearch);
    console.log("effort",effort);
    console.log("thinking",thinkingSummary);    
    console.log("MCP-selected",mcpSelected);
    console.log("selected-Model",selectedModel);
    console.log("Query:", query);
    console.log("isNewChat:", isNewChat);

    if (!query || !sourceIds?.sources || sourceIds.sources.length === 0) {
      return res.status(404).json({ message: "Missing required fields" });
    }

    const idToUse = Array.isArray(conversationId) ? conversationId[0] : (conversationId as string);

    const isExplicitNew = isNewChat === "true" ||
      idToUse === "undefined" ||
      idToUse === "new" ||
      !idToUse;

    let finalConversationId;

    if (!isExplicitNew && mongoose.Types.ObjectId.isValid(idToUse)) {
      const conversationExists = await conversationModel.findOne({ _id: idToUse, userId });
      if (conversationExists) {
        finalConversationId = conversationExists._id;
      }
    }

    if (!finalConversationId) {
      const newConversation = await conversationModel.create({
        userId,
        title: query.substring(0, 30),
        sources: sourceIds.sources.map((s: any) => ({
          sourceId: s.sourceId,
          sourceType: s.sourceType
        }))
      });
      finalConversationId = newConversation._id;
    }  
    
    const tools:toolsStrucure = []

    if(isWebSearch){
      tools.push(webSearch)
    }
    
    
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Access-Control-Expose-Headers", "X-Conversation-Id");
    res.setHeader("X-Conversation-Id", finalConversationId.toString())
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("X-Accel-Buffering", "no");
    res.setHeader("Connection", "keep-alive");
    
    res.flushHeaders?.();
    
    console.log("Agent started to call");
    const messages = await getConversation(userId, finalConversationId)
    console.log("messages in controller:", messages);
    
    const historyMessages: AgentInputItem[] = (messages ?? []).map(msg => {
      if (msg.role === 'assistant') {
        return {
          role: 'assistant',
          status: 'completed',
          type: 'message',
          content: [{ type: 'output_text', text: msg.content }]
        }
      }
      return {
        role: 'user',
        content: msg.content
      }
    });

    historyMessages.push({
      role: 'user',
      content: query
    });
    

    let mcpSelectedArray: MCPServerStreamableHttp[] = []
    let eventName
    try {
      if(mcpSelected?.includes("excalidraw")){
        eventName = "excalidraw"
        const result = await excalidrawMCP(mcpSelected)
        tools.push(result.excalidrawSkills)
        mcpSelectedArray = result.mcpSelectedArray
      }else if(mcpSelected?.includes("tldraw")){
        eventName = "tldraw"
        const result = await tldrawMCP(mcpSelected)        
        mcpSelectedArray = result.mcpSelectedArray
      }
    } catch (error) {
      console.log("Something went wrong while calling MCP");
      throw new Error("MCP Error:")
    }
    // console.log("Tools",tools);

    const notesmanAgent = new Agent({
      name: "NotesmanAI",
      instructions: buildInstructions,
      model: selectedModel,
      modelSettings: {
        reasoning: {
          effort,
          summary: thinkingSummary,
        },
        toolChoice: "auto",
        parallelToolCalls: true,
      },
      tools:[getContext],
      mcpServers:mcpSelectedArray
    })

    const result = await run(
      notesmanAgent,
      historyMessages,
      {
        stream: true,
        context: { sourceIds, userId , isWebSearch },
      }
    )

    let aiMessage = "";
    let reasoning = "";
    let elements = [];

    for await (const event of result) {
        
      if (event.type !== "raw_model_stream_event") continue;

      const data = event.data;
      // reasoning events
      if (data.type === "model" && data.event) {
        if (data.event.type === "response.reasoning_summary_text.delta") {
          const reasoningChunk = data.event.delta || "";
          process.stdout.write(reasoningChunk);
          reasoning += reasoningChunk;

          res.write(`event: message\ndata: ${(JSON.stringify({
            json: {
              type: "reasoning-delta",
              id: "0",
              delta: reasoningChunk
            }
          }))}\n\n`)
        }
        if (data.event.type === "response.reasoning_summary_text.done") {
          console.log("\n[REASONING COMPLETED]\n");
        }

        if (data.event.type === "response.output_text.delta") {
          continue;
        }
      }

      // excalidraw diagram events

      if(data.type === "model" && data.event){
        if(data.event.type === "response.function_call_arguments.done"){
          console.log(`---------------------Data Event Types :${data.event.type}`);
          console.log("Arguments",data.event.arguments);
          if(!data.event.arguments){
            console.log("Received empty arguments string");
            continue;
          }
          try {
            if(eventName === "excalidraw"){
            const args = JSON.parse(data.event.arguments);
            if(args && args.elements){
              if(typeof args.elements === "string"){
                elements = JSON.parse(args.elements);
              }else if(Array.isArray(args.elements)){
                elements = args.elements
              }
            }else{
              console.log("Arguments object was Empty");
              continue;
            }}else if (eventName === "tldraw") {
              const args = JSON.parse(data.event.arguments)
              if (args && args.code) {
                const shapesMatch = args.code.match(/const shapes = (\[[\s\S]*?\]);/);
                const arrowsMatch = args.code.match(/const arrows = (\[[\s\S]*?\]);/);

                let shapesArray = [];
                let arrowsArray = [];

                if (shapesMatch) {                  
                  const validShapesJSON = shapesMatch[1].replace(/'/g, '"');
                  shapesArray = JSON.parse(validShapesJSON);
                }

                if (arrowsMatch) {
                  const validArrowsJSON = arrowsMatch[1].replace(/'/g, '"');
                  arrowsArray = JSON.parse(validArrowsJSON);
                }

                
                elements = [...shapesArray, ...arrowsArray];
                console.log("Elements",elements);
            }}
            res.write(`event: message\ndata: ${JSON.stringify({
              json:{
                type: eventName,
                id: "0",
                elements,
              }
            })}\n\n`)
          } catch (error) {
            console.log(`Failed parsing ${data.event.type}  payload`,error);
          }
          continue;
        }
      }


      // output events
      if (data.type === "output_text_delta") {
        const textChunk = data.delta || "";

        process.stdout.write(textChunk);
        aiMessage += textChunk;
        res.write(`event: message\ndata: ${(JSON.stringify({
          json: {
            type: "text-delta",
            id: "0",
            delta: textChunk
          }
        }))}\n\n`);
      }
    }

    // log the events in file
    

    // const logFilePath = './excalidraw.json';

    // fs.writeFileSync(logFilePath, '[\n');
    // let isFirstEntry = true;

    // for await (const event of result) {
    //   // Your original console logs
    //   console.log(event);

    //   if (event.type === 'raw_model_stream_event') {
    //     console.log(`--------------------${event.type} %o`, event.data);
    //   }
    //   if (event.type === 'agent_updated_stream_event') {
    //     console.log(`---------------------${event.type} %s`, event.agent.name);
    //   }
    //   if (event.type === 'run_item_stream_event') {
    //     console.log(`---------------------${event.type} %o`, event.item);
    //   }

    //   try {
    //     const commaDelimiter = isFirstEntry ? "" : ",\n";
    //     isFirstEntry = false;

    //     fs.appendFileSync(logFilePath, commaDelimiter + JSON.stringify(event, null, 2));
    //   } catch (err) {
    //     fs.appendFileSync(logFilePath, `,\n{"error": "Failed to stringify an event item"}`);
    //   }
    // }

    // fs.appendFileSync(logFilePath, '\n]');

    console.log("Response:", result.rawResponses);
    await result.completed;
    // const usage = result.state.usage
    // console.log("usage:", usage);

    if (mcpSelectedArray && mcpSelectedArray.length > 0) {
    console.log("Cleaning up active MCP server connections...");
    
    // Use Promise.all to close all servers simultaneously and efficiently
    await Promise.all(
        mcpSelectedArray.map(async (server) => {
            try {
                // Check if the close method exists before executing it
                if (typeof server.close === 'function') {
                    await server.close();
                    console.log(`Successfully disconnected from MCP Server`);
                }
            } catch (closeError) {
                console.error("Failed to close an MCP server connection cleanly:", closeError);
            }
        })
    );
    
    // Clear out the array references to free system memory leaks
    mcpSelectedArray = []; 
}


    // end the HTTP stream
    res.end();
    // console.log("Elements",elements);
    

    // find the user usage
    // update it

    console.log(userId);
    
    const userUsageSaved = await usageModel.findOneAndUpdate(
      { userId: ObjectId.createFromHexString(userId.toString())},
      {
        $inc: {
          tokens: result.state.usage.totalTokens,
          query: 1
        },
        $addToSet:{
          chatIds: ObjectId.createFromHexString(finalConversationId.toString())
        }
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
        runValidators: true
      }
    )

    console.log("user usage saved:", userUsageSaved);

    // Starting worker
    console.log("Adding job to processing queue");

    const job = await messageQueue.add("save-message-queue", {
      userId,
      conversationId: finalConversationId,
      userMessage: query,
      aiMessage,
      reasoning,
      diagramData:elements
    }, { removeOnComplete: true, removeOnFail: true })

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


export const deleteChat = async (req: Request, res: Response) => {
  // find chat and delete
  // find all messages related to  that chat and delete
  try {
    const userId = (req as any).user.id;
    const chatId = req.query.chatId as string

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Something went wrong"
      })
    }

    const chat = await conversationModel.findByIdAndUpdate(
      { _id: chatId, userId, deletedAt: null },
      { $set: { deletedAt: new Date() } },
      { new: true }
    )
    if (!chat) {
      return res.status(404).json({
        message: "chat not found",
        success: false
      })
    }

    const job = await deleteChatQueue.add("delete-chat-queue", {
      userId,
      chatId
    }, { removeOnComplete: true, removeOnFail: true })

    console.log(`Job added to the queue ${job}`);

    return res.status(200).json({
      success: true,
      message: "chat deleted successfully"
    })

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "something went wrong"
    })
  }
}
