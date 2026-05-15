import { createAuthClient } from "better-auth/react"  // Change this line
import { usernameClient } from "better-auth/client/plugins"

console.log("NODE_ENV in autheClient:",process.env.NODE_ENV);

const appEnv = process.env.NEXT_PUBLIC_APP_ENV;
console.log("APP_ENV in authClient:", appEnv);


export const authClient = createAuthClient({
    plugins: [ 
        usernameClient(),
    ], 
    baseURL: process.env.NEXT_PUBLIC_APP_ENV === "production" ? "https:notesman.in" : "http://localhost:4000" ,
    trustedOrigins: [
		'http://localhost:4000',
		'http://api:4000',
        // "http://187.127.156.129:4000",
        "https://notesman.in"
    ],
})

export const { useSession, signIn, signOut, signUp } = authClient