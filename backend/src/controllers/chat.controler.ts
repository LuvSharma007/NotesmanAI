import { Request, Response } from "express";
import fileModel from "../models/file.model.js";
import { getContext } from "../agents/tools/getContextTool.js";
import { z } from 'zod'
import { messageQueue } from "../bullmq/queues/message.queue.js";
import { getConversation } from "../agents/tools/getConversation.js";
import urlModel from "../models/url.model.js";
import { Agent, run } from "@openai/agents";
import { SYSTEM_PROMPT } from "../lib/systemPrompt.js"

export const chat = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { query, sourceType } = req.body;
    const { id } = req.params;
    console.log("Id:", id);
    console.log("SourceType:", sourceType);
    console.log("Query:", query);


    if (!query || !id || !userId || !sourceType) {
      return res.status(404).json({ message: "Missing required fields" });
    }
    if (!["file", "url"].includes(sourceType)) {
      return res.status(400).json({ message: "Invalid sourceType" })
    }

    let source;

    if (sourceType === "file") {
      source = await fileModel.findOne({ _id: id, userId });
    } else {
      source = await urlModel.findOne({ _id: id, userId })
    }
    if (!source) {
      return res.status(404).json({ message: "Source not found" });
    }

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");
    res.flushHeaders?.();

    const notesmanAgent = new Agent({
      name: "NotesmanAI",
      instructions: SYSTEM_PROMPT,
      model: "gpt-4.1-nano",
      tools: [getContext, getConversation]
    })

    const result = await run(
      notesmanAgent,
      query, {
      stream: true,
      context: { id, userId },
    }
    )

    const stream = result.toTextStream();
    for await (const chunk of stream) {
      res.write(chunk)
    }

    res.end();

    // Starting worker
    console.log("Adding job to processing queue");

    const job = await messageQueue.add("save-message-queue", {
      userId,
      id,
      name: source.name,
      sourceType,
      userMessage: query,
      aiMessage: stream
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
