
import {Response,Request} from 'express'
import usageModel from '../models/usage.model.js';

export const userUsage = async (req:Request,res:Response)=>{
    // get userId
    // check user exists
    // if exists return the usage
    try {
        const userId = (req as any).user.id;
        if(!userId){
            return res.status(404).json({ message: "Something went wrong" });
        }

        const userExists = await usageModel.findOne({userId})
        if(userExists){
            return res.status(200).json({
                message: "fetched user usage successfully",
                success:true,
                usage:userExists
            });
        }

    } catch (error) {
        console.log("Error:",error);        
        return res.status(400).json({ message: "Failed to fetch user usage" });
    }
}