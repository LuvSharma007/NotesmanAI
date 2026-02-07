import axios from "axios";
import { Request, Response } from "express";
import crypto from 'crypto';
import urlModel from "../models/url.model.js"
import { urlQueue } from "../bullmq/queues/url.queue.js";
import path from "path";


export const scrapeUrl = async (req: Request, res: Response) => {
    // receive Url in req.body
    // validate Url by making request
    // save the Url and userId in mongoDB
    // push data into queue

    try {
        const { url } = req.body
        const userId = (req as any).user.id;

        if (!userId || !url) {
            return res.status(400).json({
                success: false,
                message: "Not Authorized or Url is required"
            })
        }

        console.log("User URL:", url);
        console.log("User Id:", userId);

        // validate URL 
        const response = await axios.get(url);
        if (response.statusText !== "OK" && response.status !== 200) {
            return res.status(404).json({
                success: false,
                message: "Invalid URL"
            })
        }
        console.log("response checked");

        const urlHash = crypto.createHash('md5').update(url).digest('hex');
        const qdrantCollection = `user_${userId}_${urlHash}`;

        // send to frontend
        const parsedUrl = new URL(url)
        const fileName = parsedUrl.hostname.replace(/^www\./, '')
        console.log("Filename:",fileName);

        // save the data into mongoDB

        const dataSaved = await urlModel.create({
            userId,
            url,
            qdrantCollection,
            name:fileName
        })
        if (!dataSaved) {
            return res.status(500).json({
                success: false,
                message: "Server Error"
            })
        }
        
        // push the data into the queue

        const job = await urlQueue.add("url-queue", {
            url,
            userId,
            qdrantCollection,
            name:fileName
        }, { removeOnComplete: true, removeOnFail: true })

        console.log(`Job added to the queue${job}`);

        return res.status(200).json({
            success: true,
            message: "Extracting content through URL",
            url:{
                id:dataSaved._id.toString(),
                name:fileName
            }
        })
    } catch (error) {
        console.log("Error extracting URL:", error);
        return res.status(500).json({
            success: false,
            message: "Error Extreacting Web content through URL"
        })
    }
}

export const getAllUrls = async(req:Request,res:Response)=>{
    try {
        const userId = (req as any).user.id
        console.log("UserId:",userId);

        const allUrls = await urlModel.find({userId}).sort({createdAt:-1})
        console.log("allUrls",allUrls);

        if(!allUrls || allUrls.length === 0){
            return res.status(200).json({
                success:false,
                urls:[],
                message:"No Urls Found"
            })
        }
        return res.status(200).json({
            success:true,
            urls:allUrls,
            message:"Successfully reterived all Urls"
        })
    } catch (error) {
        console.error("Error fetching URLs:",error);
        return res.status(500).json({
            success:false,
            message:"Server error fetching Urls",
            details:(error as Error).message
        })
    }
}