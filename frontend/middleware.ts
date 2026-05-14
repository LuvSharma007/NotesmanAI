import { NextResponse,NextRequest } from "next/server";
export async function middleware(request:NextRequest){
    try {
        console.log("Middleware runned",);

        const cookie = request.cookies.get("__Secure-notesman.session_token");
        
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