import { createAuthClient } from "better-auth/react"  // Change this line
import { usernameClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    plugins: [ 
        usernameClient(),
    ], 
    baseURL: "http://notesman.in",
    trustedOrigins: [
		// 'http://localhost:4000',
		// 'http://api:4000',
        // "http://187.127.156.129:4000",
        "http://notesman.in"
    ],
})

export const { useSession, signIn, signOut, signUp } = authClient