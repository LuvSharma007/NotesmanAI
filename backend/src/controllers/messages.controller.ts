import { Request , Response } from "express";
import messageModel from "../models/messages.model.js";
import conversationModel from "../models/conversation.model.js";
import fileModel from "../models/file.model.js";
import urlModel from "../models/url.model.js";


export const getMessage = async(req:Request,res:Response)=>{
    try {
        const userId = (req as any).user.id;
        const conversationId = req.query.conversationId as string;
        console.log("ConversationId:",conversationId);
        console.log("User Id:",userId);

        if(!conversationId || !userId){
            return res.status(400).json({success:false,message:"sourceId or userId is required"})
        }

        // const cacheMessages = await redisClient.lrange(`chat:${userId}:${conversationId}`,0,4)
        // if(cacheMessages && cacheMessages.length > 0){
        //     console.log("Cache hit");
        //     const parseMessages = cacheMessages.map(msg => JSON.parse(msg))
        //     console.log("Messages from redis",cacheMessages); 
        //     return res.status(200).json({
        //         success:true,
        //         messages:parseMessages,
        //         source:"redis"
        //     })
        // }
        console.log("Cache miss");        
        const userMessages = await messageModel.find({ userId, conversationId })
            .sort({ createdAt: 1})
            .lean();            
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

export const getSources = async(req:Request,res:Response)=>{
    try {
        const userId = (req as any).user.id;
        const conversationId = req.query.conversationId as string;
        console.log("ConversationId:",conversationId);
        console.log("User Id:",userId);

        if(!conversationId || !userId){
            return res.status(400).json({success:false,message:"sourceId or userId is required"})
        }

        // Find sources in DB

        const conversationDetails = await conversationModel.findOne({_id:conversationId,userId})
        if(!conversationDetails){
            return res.status(400).json({
                success:false,
                message:"Failed to fetch resources",
                sources:[]
            })
        }

        const fileIds = conversationDetails.sources.filter(s => s.sourceType === "file").map(s => s.sourceId)
        const urlIds = conversationDetails.sources.filter(s => s.sourceType === "url").map(s => s.sourceId)

        const [files,urls] = await Promise.all([
            fileModel.find({_id:{ $in: fileIds},userId}),
            urlModel.find({_id:{$in:urlIds},userId})
        ])
        console.log("files",files);
        console.log("urls",urls);
        const allSources = [...files,...urls]
        
        return res.status(200).json({
            success:true,
            message:"Successfully fetched sources",
            sources:allSources
        })

    } catch (error) {
        return res.status(400).json({
                success:false,
                message:"Something went wrong",
        })
    }
}

export const getChats = async(req:Request,res:Response)=>{
    try {
        const userId = (req as any).user.id;
        if(!userId){
            return res.status(400).json({
                success:false,
                message:"Could not load chats"
            })
        }

        const skip = parseInt(req.query.skip as string) || 0
        const limit = 15;

        const userChats = await conversationModel.find({userId})
            .sort({createdAt: -1})
            .skip(skip)
            .limit(limit)
            .select("title _id createdAt");

        console.log("Userchats:",userChats);
        

        if(!userChats){
            return res.status(400).json({
                success:false,
                message:"chats not found"
            })
        }

        return res.status(200).json({
            success:true,
            chats:userChats,
            nextSkip:userChats.length === limit ? skip + limit : null
        })
    } catch (error) {
        return res.status(400).json({
            message:"Error fetching chats",
            success:false
        })
        
    }
}

