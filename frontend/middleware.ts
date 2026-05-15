import { NextResponse,NextRequest } from "next/server";
export async function middleware(request:NextRequest){
    try {
        console.log("Middleware runned",);
        console.log("Middleware running, NODE_ENV:",process.env.NODE_ENV);

        console.log("Middleware running, APP_ENV:", process.env.APP_ENV);
        
        const cookie = request.cookies.get( process.env.NEXT_PUBLIC_APP_ENV === "production" ? "__Secure-notesman.session_token" : "notesman.session_token");
        // const cookie = request.cookies.get("notesman.session_token");

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