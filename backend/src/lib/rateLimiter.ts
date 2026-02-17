import { NextFunction, Request, Response } from "express"
import { redisClient } from "../lib/redisClient.js"

export const rateLimiter = async(req:Request,res:Response,next:NextFunction)=>{

    const key = `rate:${req.ip}`
    const limit = 30; // request
    const window = 60

    const currentRequestCounter = await redisClient.incr(key)

    if(currentRequestCounter === 1){
        await redisClient.expire(key,window);
    }

    if(currentRequestCounter>limit){
        return res.status(429).json({
            success:true,
            message:"Too many requests"
        })
    }

    next();

}