import {auth} from "@/lib/auth"
import { NextResponse, NextRequest } from "next/server"
import { connectDB } from "@/lib/db"

export async function POST(req:NextRequest){
    await connectDB();
    try {
        const body = await req.json();
        const {email,password,username,name} = body;

        if(!email || !password || !username || !name){
            return NextResponse.json(
                {error:"All fields are required"},
                {status:400}
            )
        }   
        console.log("email:",email);
        console.log("password:",password);
        console.log("username:",username);
        console.log("name:",name);
        

        const user = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name,
                username
            },
        });

        return NextResponse.json({
            success:true,
            message:"User signup successfully",
            user,
        },{status:200});

    } catch (error:any) {
        console.log("Error signup user",error);
        
        return NextResponse.json({
            success:false,
            message:"User signup Error"
        },{status:500});
    }    
}