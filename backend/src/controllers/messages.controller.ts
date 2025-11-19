import { Request , Response } from "express";
import messageModel from "../models/messages.model.js";
import { client } from "../lib/redisClient.js";


export const getMessage = async(req:Request,res:Response)=>{
    try {
        const userId = (req as any).user.id;
        const fileId = req.query.fileId
        console.log("User Id:",userId);
        console.log("File Id:",fileId);

        if(!fileId){
            return res.status(400).json({success:false,message:"filedId is required"})
        }

        // first accessing messages from redis , if not found then access from mongoDB

        const cacheMessages = client.lrange(`chat:${userId}:${fileId}`,0,4)
        console.log("Messages from redis",cacheMessages);       


        
        const userMessages = await messageModel.find({userId,fileId}).sort({createdAt:1});
        console.log("User Messages Found:",userMessages);     

        if(userMessages.length === 0){
            return res.status(200).json({
                success:true,
                messages:[],
                message:"No messages found",
            })
        }

        return res.status(200)
            .json({
            success:true,
            messages:userMessages
        })

    } catch (error) {
        console.log("Error fetching Messages:",error);
        return res.status(500).json({
            success:false,
            message:"No messages found"
        })        
    }
}