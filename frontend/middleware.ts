import { NextResponse,NextRequest } from "next/server";
import {getSessionCookie} from 'better-auth/cookies'

export async function middleware(request:NextRequest){
    try {
        console.log("Middleware runned",);
        const cookie = getSessionCookie(request,{
            cookiePrefix:"notesman",
            cookieName:"session_token"
        })
        console.log("cookie:",cookie);
        
        
        if(!cookie){
            console.log("Unauthorized Access");        
            return NextResponse.redirect(new URL("/login",request.url))
        } 
        return NextResponse.next()
    } catch (error) {
        console.log("Error:",error);
        return NextResponse.redirect(new URL("/login",request.url))
    }
}

export const config = {
    matcher:["/chat/:path*","/sources"]
}