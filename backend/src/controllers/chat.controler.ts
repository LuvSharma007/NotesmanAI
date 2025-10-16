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

        const result = await run(agent,query,{
            context:{userId, fileId,qdrantCollectionName}
        });

        console.log("Result response:" , result.finalOutput);
        res.json({output:result.finalOutput})
    } catch (error) {
        console.error(error)
        res.status(500).json({message:"Internal server error"})
    }
}