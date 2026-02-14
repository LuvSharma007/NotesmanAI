import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { username } from "better-auth/plugins";
import { MongoClient } from 'mongodb'
import { resend } from "./resend.js";

const mongoDBConnectionString = process.env.MONGODB_CONNECTION_STRING
const mongoDbName = process.env.MONGODB_NAME
const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

if (!mongoDBConnectionString || !googleClientId || !googleClientSecret) {
    throw new Error('Missing MongoDB Environment variables')
}

const mongodb = new MongoClient(mongoDBConnectionString).db(mongoDbName)

export const auth = betterAuth({
    database: mongodbAdapter(mongodb),
    baseURL: process.env.BETTER_AUTH_URL,

    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url, token },Request) => {

            const {data,error} = await resend.emails.send({
                from: "bakihanma9910@gmail.com",   // change it to you domain name
                to: user.email,
                subject: "Reset Your Password",
                text: `Click the link to reset your password: ${url}`
            })
            if(error){
                console.log("Resend Error:",error);
            }
            console.log("data:",data);           
            
        },
        requireEmailVerification: false
    },

    plugins: [
        username()
    ],
    socialProviders: {
        google: {
            prompt: "select_account",
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            redirectURI: "http://localhost:4000/api/auth/callback/google"
        },
    },
    session: {
        create:{
            after:async(session:any)=>{
                // deleting the all previous sessions of the user
                const previousSession = mongodb.collection("session").find({
                    userId:session.userId,
                    _id:{$ne:session._id}
                })
                console.log("previous session deleted",previousSession);
                
            }
        },
        cookieCache:{
            enabled:true,
            maxAge:60 * 60 * 24 * 60, // 2 month
            strategy:"jwt",
            refreshCache:{
                updateAge:60*60*24*7 // refresh when 7 days left 
            }
        },
        expiresIn: 60 * 60 * 24 * 60, // 2 month
        updateAge: 60 * 60 * 24 // 1 day before session is expires
    },
    advanced: {
        ipAddress:{
            ipAddressHeaders:["x-forwarded-for"]
        }
    },
    rateLimit:{
        window:60, // time window in seconds
        max: 10, // ,ax requests in the window
        customRules:{
            "/sign-in/email":{
                window:10,
                max:3
            },
            "/get-session":false
        }
    },
    trustedOrigins: ["http://localhost:3000", "http://localhost:4000"],
});