import { NextResponse,NextRequest } from "next/server";

export async function middleware(request:NextRequest){
    try {
        console.log("Middleware runned",);
        const cookie = request.cookies.get("better-auth.session_token")?.value;
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
    // matcher:[
    //     {
    //         source:"/c/:path*",
    //         has:[
    //             {type:'data',key:'session',value:'token'},
    //             {type:'data',key:'user',value:'id'}
    //         ],
    //         missing:[
    //             {type:'data',key:'session',value:'token'},
    //             {type:'data',key:'user',value:'id'}
    //         ]
    //     }
    // ]

    matcher:"/c/:path*"

}