import {auth} from "@/lib/auth"
import { NextResponse, NextRequest } from "next/server"
import { connectDB } from "@/lib/db"

export async function POST(req:NextRequest){
    await connectDB();
    try {
        const body = await req.json();
        const {email,password} = body;

        if(!email || !password){
            return NextResponse.json(
                {error:"All fields are required"},
                {status:400}
            )
        }   
        console.log("email:",email);
        console.log("password:",password);
        

        const user = await auth.api.signInEmail({
            body: {
                email,
                password,
                rememberMe:true,
                callbackURL:"http://localhost:3001/login"
            },
        });

        return NextResponse.json({
            success:true,
            message:"User signIn successfull",
            user,
        },{status:200});

    } catch (error:any) {
        console.log("Error signIn user",error);
        
        return NextResponse.json({
            success:false,
            message:"User signIn Error"
        },{status:500});
    }    
}