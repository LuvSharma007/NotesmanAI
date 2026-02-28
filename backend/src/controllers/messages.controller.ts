import { Request , Response } from "express";
import messageModel from "../models/messages.model.js";
import { redisClient } from "../lib/redisClient.js";


export const getMessage = async(req:Request,res:Response)=>{
    try {
        const userId = (req as any).user.id;
        const id = req.query.id
        console.log("User Id:",userId);
        console.log("id:",id);

        if(!id || !userId){
            return res.status(400).json({success:false,message:"filedId or userId is required"})
        }

        const cacheMessages = await redisClient.lrange(`chat:${userId}:${id}`,0,4)
        if(cacheMessages && cacheMessages.length > 0){
            console.log("Cache hit");
            const parseMessages = cacheMessages.map(msg => JSON.parse(msg))
            console.log("Messages from redis",cacheMessages); 
            return res.status(200).json({
                success:true,
                messages:parseMessages,
                source:"redis"
            })
        }
        console.log("Cache hit");        
        const userMessages = await messageModel.find({userId,id}).sort({createdAt:1});  // returns the messages in asc order(oldest to newest)
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
            messages:userMessages,
            source:"database"
        })

    } catch (error) {
        console.log("Error fetching Messages:",error);
        return res.status(500).json({
            success:false,
            message:"No messages found"
        })        
    }
}