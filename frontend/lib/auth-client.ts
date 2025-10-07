import { createAuthClient } from "better-auth/react"  // Change this line
import { inferAdditionalFields, usernameClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    plugins: [ 
        usernameClient(),
        inferAdditionalFields()
    ], 
    baseURL:'http://localhost:4000'
})

export const { useSession, signIn, signOut, signUp } = authClient