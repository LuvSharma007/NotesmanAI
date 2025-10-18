import { Request , Response } from "express"
import { run } from "@openai/agents"
import { agent } from "../agents/agents.js"
import fileModel from "../models/file.model.js";

export const chat = async(req:Request,res:Response)=>{
    try {
        const userId = (req as any).user.id
        const {query,fileId } = req.body;
        if(!query || !fileId || !userId){
            return res.status(404).json({
                message:"No query found"
            })
        }

        const file = await fileModel.findOne({_id:fileId,userId})
        if(!file){
            return res.status(404).json({message:"File not found"})
        }

        const qdrantCollectionName = file.qdrantCollection

        const stream = await run(agent,query,{
            context:{userId, fileId,qdrantCollectionName},
            stream:true
        });

        res.setHeader("Content-Type","text/plain; charset=utf-8");
        res.setHeader("Transfer-Encoding","chunked");
        res.setHeader("Cache-Control","no-cache");
        res.flushHeaders?.();

        const textStream = stream.toTextStream({ compatibleWithNodeStreams: true })

        textStream.on("data",(chunk:Buffer)=>{
            res.write(chunk);
        })

        textStream.on("end",async()=>{
            await stream.completed;
            res.end();
        })

        textStream.on("error", (err: Error) => {
            console.error("Streaming error:", err);
            if (!res.headersSent) {
                res.status(500).json({ message: "Error during streaming" });
            } else {
                res.end();
            }
        });

    } catch (error) {
        console.error("Error is chat controller",error)
        if(!res.headersSent){
            res.status(500).json({message:"Internal server error"})
        }
    }
}