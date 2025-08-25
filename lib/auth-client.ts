import { createAuthClient } from "better-auth/react"  // Change this line
import { usernameClient } from "better-auth/client/plugins"
 
export const authClient = createAuthClient({
    plugins: [ 
        usernameClient() 
    ], 
    baseURL:process.env.BETTER_AUTH_URL!
})

export const { useSession, signIn, signOut, signUp , getSession } = authClient