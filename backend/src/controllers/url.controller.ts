import axios from "axios";
import { Request, Response } from "express";
import crypto from 'crypto';
import urlModel from "../models/url.model.js"
import { urlQueue } from "../bullmq/queues/url.queue.js";


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

        // save the data into mongoDB

        const dataSaved = await urlModel.create({
            userId,
            url
        })
        if (!dataSaved) {
            return res.status(500).json({
                success: false,
                message: "Server Error"
            })
        }


        const urlHash = crypto.createHash('md5').update(url).digest('hex');
        const qdrantCollection = `user_${userId}_${urlHash}`;


        // push the data into the queue

        const job = await urlQueue.add("url-queue", {
            url,
            userId,
            qdrantCollection
        }, { removeOnComplete: true, removeOnFail: true })

        console.log(`Job added to the queue${job}`);

        return res.status(200).json({
            sucess: true,
            message: "Extracting content through URL",
        })
    } catch (error) {
        console.log("Error extracting URL:", error);
        return res.status(500).json({
            success: false,
            message: "Error Extreacting Web content through URL"
        })
    }
}