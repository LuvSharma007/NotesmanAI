import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { username } from "better-auth/plugins";
import { MongoClient } from 'mongodb'
import { resend } from "./resend.js";

const mongoUri = process.env.MONGODB_URI
const mongodbName = process.env.MONGODB_NAME
const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

if(!mongoUri || !mongodbName || !googleClientId || !googleClientSecret){
    throw new Error('Missing MongoDB Environment variables')
}

const mongodb = new MongoClient(mongoUri).db('NotesmanAI')

export const auth = betterAuth({
    database: mongodbAdapter(mongodb),
    baseURL:process.env.BETTER_AUTH_URL,
    
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url, token }) => {
                        
            await resend.emails.send({
                from: "onboarding@resend.dev",
                to: user.email,
                subject: "Reset Your Password",
                text: `Click the link to reset your password: ${url}`
            })
        },
        requireEmailVerification:false
    },

    plugins:[
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
    session:{
        expiresIn:60 * 60 * 24 * 60, // 2 month
        updateAge:60 * 60 * 24 // 1 day before session is expires
    },
    trustedOrigins: ["http://localhost:3000", "http://localhost:4000"],
});