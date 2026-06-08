import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { username } from "better-auth/plugins";
import { MongoClient } from 'mongodb'
import { resend } from "./resend.js";

const mongoDBConnectionString = process.env.MONGODB_CONNECTION_STRING
const mongoDbName = process.env.MONGODB_NAME
const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET
const isProduction = process.env.NODE_ENV


if (!mongoDBConnectionString || !googleClientId || !googleClientSecret) {
    throw new Error('Missing MongoDB Environment variables')
}

export const mongodb = new MongoClient(mongoDBConnectionString).db(mongoDbName)

const createResetEmailTemplate = (resetUrl: string, userName: string) => {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Reset Your Password</title>
      </head>
      <body>
        <h1>Hello ${userName}</h1>
        <p>Click the button below to reset your password:</p>
        <p>Link will expire within one hour for security reasons</p>
        <a href="${resetUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none;">
          Reset Password
        </a>
      </body>
    </html>
  `;
};

export const auth = betterAuth({
    database: mongodbAdapter(mongodb),
    baseURL: process.env.NODE_ENV === "production" ? process.env.BETTER_AUTH_URL : "http://localhost:4000" ,

    emailAndPassword: {
        enabled: true,
        resetPasswordTokenExpiresIn: 3600,
        sendResetPassword: async ({ user, url, token }, Request) => {

            const emailHtml = createResetEmailTemplate(url, user.name)

            const { data, error } = await resend.emails.send({
                from: "Notesman@mail.notesman.in",   // any_name@subDomain
                to: user.email,
                subject: "Reset Your Password",
                html: emailHtml
            })
            if (error) {
                console.log("Resend Error:", error);
            }
        },
        requireEmailVerification: false
    },

    plugins: [
        username(),
    ],
    socialProviders: {
        google: {
            prompt: "select_account",
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            redirectURI: "https://notesman.in/api/auth/callback/google"
        },
    },
    session: {
        create: {
            after: async (session: any) => {
                // deleting the all previous sessions of the user
                const previousSession = mongodb.collection("session").find({
                    userId: session.userId,
                    _id: { $ne: session._id }
                })
                console.log("previous session deleted", previousSession);

            }
        },
        cookieCache: {
            maxAge: 60 * 60 * 24 * 60, // 2 month
            strategy: "jwt",
            refreshCache: {
                updateAge: 60 * 60 * 24,
            },
        },
        expiresIn: 60 * 60 * 24 * 60, // 2 month
        updateAge: 60 * 60 * 24 // 1 day before session is expires
    },
    advanced: {
        crossSubDomainCookies:{
            enabled:true,
            domain: isProduction === 'production' ? 'notesman.in' : undefined
        },
        useSecureCookies:isProduction === 'production' ? true : false,
        trustedProxyHeaders:true,
        cookiePrefix:"notesman",
        ipAddress:{
            ipAddressHeaders:["x-forwarded-for"]
        },
        defaultCookieAttributes:{
            secure:isProduction === 'production' ? true : false,
            sameSite:isProduction === 'production' ? 'None' : 'Lax',
            httpOnly:true
        }
    },
    rateLimit: {
        window: 60, // time window in seconds
        max: 10, // ,ax requests in the window
        customRules: {
            "/sign-in/email": {
                window: 10,
                max: 3
            },
            "/get-session": false
        }
    },
    trustedOrigins: [
        "http://localhost:3000",
        "http://localhost:4000",
        "http://frontend:3000",
        "http://api:4000",
        // "http://187.127.156.129:3000",
        // "http://187.127.156.129:4000",
        "https://notesman.in"
    ],
});