import { Request, Response } from "express";
import { getContext } from "../agents/tools/getContextTool.js";
import { messageQueue } from "../bullmq/queues/message.queue.js";
import { getConversation } from "../agents/tools/getConversation.js";
import { Agent, AgentInputItem, run } from "@openai/agents";
import { SYSTEM_PROMPT } from "../lib/systemPrompt.js"
import conversationModel from "../models/conversation.model.js";
import mongoose from "mongoose";
import usageModel from "../models/usage.model.js";
import { deleteChatQueue } from "../bullmq/queues/deleteChat.queue.js";

export const chat = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { query, sourceIds } = req.body;
    const { conversationId } = req.params;
    const { isNewChat } = req.query;
    console.log("ConversationId:", conversationId);
    console.log("SourceIds:", sourceIds);
    console.log("Query:", query);
    console.log("isNewChat:", isNewChat);

    if (!query || sourceIds.sources.length === 0) {
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


    res.setHeader("Content-Type", "text/plain; charset=utf-8");
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
      instructions: SYSTEM_PROMPT,
      model: "gpt-4.1-mini",
      tools: [
        getContext
      ],
    })

    const result = await run(
      notesmanAgent,
      historyMessages,
      {
        stream: true,
        context: { sourceIds, userId },
      }
    )

    let aiMessage = "";
    const stream = result.toTextStream({ compatibleWithNodeStreams: true });
    for await (const chunk of stream) {  
      aiMessage += chunk;

      res.write(chunk)
    }

    console.log("Response:", result.rawResponses);
    await result.completed;
    // const usage = result.state.usage
    // if(usage){
    //   const redisKey = `usage${userId}`
    //   const {totalTokens} = usage
    //   await Promise.all([
    //     redisClient.hincrby(redisKey,"tokens",totalTokens),
    //     redisClient.hincrby(redisKey,"query",1)
    //   ])
    //   console.log(`tokens ${totalTokens} used for run`);

    //   // add data to usageQueue
    //   await usageQueue.add('usage-queue',{
    //     userId
    //   })
    // }


    res.end();


    // find the user usage
    // update it

    const userUsageSaved = await usageModel.findOneAndUpdate(
      { userId: userId },
      {
        $inc: {
          tokens: result.state.usage.totalTokens,
          query: 1
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
      aiMessage
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


export const deleteChat = async(req:Request,res:Response)=>{
    // find chat and delete
    // find all messages related to  that chat and delete
    try {
        const userId = (req as any).user.id;
        const chatId = req.query.chatId as string

        if(!userId){
            return res.status(400).json({
                success:false,
                message:"Something went wrong"
            })
        }

        const chat = await conversationModel.findByIdAndUpdate(
            {_id:chatId,userId,deletedAt:null},
            {$set:{deletedAt:new Date()}},
            {new:true}
        )
        if(!chat){
            return res.status(404).json({
                message:"chat not found",
                success:false
            })
        }

        const job = await deleteChatQueue.add("delete-chat-queue",{
            userId,
            chatId
        },{ removeOnComplete: true, removeOnFail: true })

        console.log(`Job added to the queue ${job}`);       
        
        return res.status(200).json({
                success:true,
                message:"chat deleted successfully"
        })
        
    } catch (error) {
        return res.status(400).json({
            success:false,
            message:"something went wrong"
        })
    }
}
