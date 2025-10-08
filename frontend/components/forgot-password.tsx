'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { Logo } from './logo'

import { useState } from 'react'
import { toast } from 'sonner'
import { Spinner } from './ui/shadcn-io/spinner'
import {z} from 'zod'
import { authClient } from '@/lib/auth-client'

const formSchema = z.object({
    email:z.string().email(),
})

type FormValues = z.infer<typeof formSchema>

export default function ForgotPasswordPage() {

    const [loading, setLoading] = useState(false)
    const [email,setEmail] = useState("")

    const handleSendRestLink = async(e:React.FormEvent)=>{
        e.preventDefault()

        const parsed = formSchema.safeParse({email})
        if(!parsed.success){
            toast.error("Please enter a valid email")
            return
        }

        setLoading(true)

        try {
            const {data ,error}= await authClient.forgetPassword({
                email:parsed.data.email,
                redirectTo:'http://localhost:3000/reset-password'    
            })
            console.log("Email Response:",data);
            

            if(error){
                toast.error(error.message)
            }else{
                toast.success('Email Send Successfully for Reset Password')
            }
        } catch (error:any) {
            console.log("Error sending Reset Email for forgot password");
            toast.error(error.message)
        }finally{
            setLoading(false);
        }

    }


    return (
        <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
            <form
                onSubmit={handleSendRestLink}
                action=""
                className="bg-muted m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]">
                <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
                    <div>
                        <Link
                            href="/"
                            aria-label="go home">
                            <Logo/>
                        </Link>
                        <h1 className="mb-1 mt-4 text-xl font-semibold">Recover Password</h1>
                        <p className="text-sm">Enter your email to receive a reset link</p>
                    </div>

                    <div className="mt-6 space-y-6">
                        <div className="space-y-2">
                            <Label
                                htmlFor="email"
                                className="block text-sm">
                                Email
                            </Label>
                            <Input
                                type="email"
                                required
                                name="email"
                                id="email"
                                value={email}
                                onChange={(e)=>setEmail(e.target.value)}
                                placeholder="name@example.com"
                            />
                        </div>

                        <Button className="w-full">{loading ? <Spinner/> : "Send Reset Link"}</Button>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-muted-foreground text-sm">We'll send you a Email to reset your password.</p>
                    </div>
                </div>

                <div className="p-3">
                    <p className="text-accent-foreground text-center text-sm">
                        Remembered your password?
                        <Button
                            asChild
                            variant="link"
                            className="px-2">
                            <Link href="/login">Log in</Link>
                        </Button>
                    </p>
                </div>
            </form>
        </section>
    )
}
