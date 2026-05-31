import { Request, Response } from "express";
import { getContext } from "../agents/tools/getContextTool.js";
import { messageQueue } from "../bullmq/queues/message.queue.js";
import { getConversation } from "../agents/tools/getConversation.js";
import { Agent, AgentInputItem, run } from "@openai/agents";
import conversationModel from "../models/conversation.model.js";
import mongoose from "mongoose";
import usageModel from "../models/usage.model.js";
import { deleteChatQueue } from "../bullmq/queues/deleteChat.queue.js";
import buildInstructions from "../lib/systemPrompt.js";
import fs from 'fs'
import { ObjectId } from "mongodb";
import { webSearch } from "../agents/tools/webSearchTool.js";
import { id } from "zod/v4/locales";

export interface SourceItem {
  sourceId: string;
  sourceType: string;
}

export interface SourcePayload {
  sources: SourceItem[];
}

interface RequestBody {
  query: string;
  sourceIds: SourcePayload;
  isWebSearch:boolean
}

export const chat = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { query, sourceIds , isWebSearch } = req.body as Partial<RequestBody>;
    const { conversationId } = req.params;
    const { isNewChat } = req.query;
    console.log("ConversationId:", conversationId);
    console.log("SourceIds:", sourceIds);
    console.log("isWebSearch",isWebSearch);
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

    // set web search

    const tools = [getContext]
    if(isWebSearch){
      tools.push(webSearch)
    }
    console.log("Tools",tools);
    

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



    const notesmanAgent = new Agent({
      name: "NotesmanAI",
      instructions: buildInstructions,
      model: "gpt-5-nano-2025-08-07",
      modelSettings: {
        reasoning: {
          effort: "medium",
          summary: "concise",
        },
        text:{
          verbosity:"medium"
        },
        toolChoice:"required",
        parallelToolCalls:true,
      },
      tools
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
    // const stream = result.toTextStream({ compatibleWithNodeStreams: true });
    // for await (const event of stream) {
    // console.log("---------Chunk",chunk.toString());      

    // aiMessage += chunk;

    // res.write(chunk)
    // }

    //--------------------------------------------------------------------

    for await (const event of result) {
  if (event.type !== "raw_model_stream_event") continue;

  const data = event.data;
  // reasoning phase
  if (data.type === "model" && data.event) {
    if (data.event.type === "response.reasoning_summary_text.delta") {
      const reasoningChunk = data.event.delta || "";
      process.stdout.write(reasoningChunk);
      reasoning += reasoningChunk;

      res.write(`event: message\ndata: ${(JSON.stringify({
        json:{
          type:"reasoning-delta",
          id:"0",
          delta:reasoningChunk
        }
      }))}\n\n`)
    }
    if (data.event.type === "response.reasoning_summary_text.done") {
      console.log("\n[REASONING COMPLETED]\n");
    }

  //   if (data.event.type === "run_item_stream_event" && data.event.item){
  //   const item = data.event.item;

  //   if (item.type === "tool_call_item" && item.raw_item) {
  //     const toolName = item.raw_item.name || "";
  //     const toolArgs = JSON.stringify(item.raw_item.arguments || {});
      
  //     console.log(`\n[tool call]: ${toolName}(${toolArgs})`);

  //     // Stream the tool call metadata to the frontend
  //     const toolData = JSON.stringify({ name: toolName, arguments: toolArgs });
  //     res.write(`event: tool_call\ndata: ${(toolData)}\n\n`);
  //   }
  // }
    
    //stop duplicates
    if (data.event.type === "response.output_text.delta") {
      continue; 
    }
  }

  // output_text_delta - final response of models
  if (data.type === "output_text_delta") {
    const textChunk = data.delta || "";
    
    process.stdout.write(textChunk);
    aiMessage += textChunk;
    res.write(`event: message\ndata: ${(JSON.stringify({
      json:{
        type:"text-delta",
        id:"0",
        delta:textChunk
        }
    }))}\n\n`);
  }

}

  // log the events in file
    //----------------------------------------------------------------------------

    // 1. Define the log file destination path
    // const logFilePath = './stream_debug.json';

    // // 2. Clear the file and initialize a clean JSON array structure on every request
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

    //   // 3. Append the raw event into your JSON file
    //   try {
    //     const commaDelimiter = isFirstEntry ? "" : ",\n";
    //     isFirstEntry = false;

    //     // Safely append the formatted object string to the file
    //     fs.appendFileSync(logFilePath, commaDelimiter + JSON.stringify(event, null, 2));
    //   } catch (err) {
    //     fs.appendFileSync(logFilePath, `,\n{"error": "Failed to stringify an event item"}`);
    //   }
    // }

    // // 4. Properly seal the JSON array brackets when the stream ends completely
    // fs.appendFileSync(logFilePath, '\n]');


    console.log("Response:", result.rawResponses);
    await result.completed;
    // const usage = result.state.usage
    // console.log("usage:", usage);


    // end the HTTP stream
    res.end();

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
      reasoning

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
