import { createAuthClient } from "better-auth/react"  // Change this line
import { usernameClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    plugins: [ 
        usernameClient(),
    ], 
    baseURL: process.env.NODE_ENV === "development" ?
    "http://localhost:4000" : process.env.NEXT_PUBLIC_API_URL,
    trustedOrigins: [
		'http://localhost:4000',
        // 'http://76.13.242.203:4000',
		// 'http://api:4000',
        // "https://notesman.in"
    ],
})

export const { useSession, signIn, signOut, signUp } = authClient