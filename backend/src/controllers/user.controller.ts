import { Request, Response } from "express"
import usageModel from "../models/usage.model.js"

export const getUser = async (req: Request, res: Response) => {
    // get the user id 
    // validate the user
    // return the user usage infor from usage model

    try {
        const userId = (req as any).user.id
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized Access : missing user credentials" })
        }
        const userExists = await usageModel.findOne({ userId })
        if (!userExists) {
            return res.status(404).json({
                message: "usage record not found for this user",
                success: false,
            })
        }
        return res.status(200).json({
            message: "fetched user usage successfully",
            success: true,
            usage: userExists
        });
    } catch (error) {
        console.log("Error getting user usage", error);
        return res.status(500).json({
            message: "Internal server error occured",
            success: false,
        })
    }
}