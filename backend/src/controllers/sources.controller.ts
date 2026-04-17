import { Request, Response } from "express";
import urlModel from "../models/url.model.js";
import mongoose from "mongoose";

export const getAllSources = async (req: Request, res: Response) => {
    try {
        // get skip from frontend localstorage and send it as query params
        // filter URLs
        // combine URls with File collection 
        // sort them with createdAt
        // paginate
        // project the result (include nessessary fields)
        
        const userId = (req as any).user.id;
        const skip = parseInt(req.query.skip as string) || 0
        const limit = 10;

        const userObjectId = new mongoose.Types.ObjectId(userId)        
        console.log("UserId:",userId);
        console.log("skip",skip);

        const sources = await urlModel.aggregate([
            {$match:{userId:userObjectId}},
            {
                $unionWith:{
                    coll:"files",
                    pipeline:[
                        {$match:{userId:userObjectId}}
                    ]
                }
            },
    
            {$sort:{createdAt:-1}},
            {$skip:skip},
            {$limit:limit},
    
            {
                $project:{
                    name:1,
                    sourceType:1,
                    fileSize:1,
                    url:1,
                    status:1,
                    createdAt:1,
                }
            }
        ])
    
        console.log("Sources:",sources);
    
        return res.status(200).json({
            success:true,
            message:"sources fetch successfully",
            sources:sources
        })
        
    } catch (error) {
        console.log("Error while fetching sources",error);
        return res.status(400).json({
            success:false,
            message:"something went wrong",
        })
        
    }
}