'use client'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axios from "axios"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const [name , setName] = useState("")
  const [username , setUsername] = useState("")
  const [email , setEmail] = useState("")
  const [password , setPassword] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent)=>{
    e.preventDefault();
    try {
      const res = await axios.post(`/api/auth/signup`,{
        name,
        username,
        email,
        password
      })  
      console.log(res);
      

      if(res.status === 200 || res.status === 201 || res.data.ok || res.data.success){
      console.log("Signup Successfully", res.data);
      router.push('/login');
      }else{
        console.error("Error:", res.data.error);
      }

    } catch (err:any) {
      console.error("Request failed:", err.response?.data || err.message);
    }    
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold">SIGNUP</CardTitle>
        </CardHeader>
        <CardContent>
          <form
          onSubmit={handleSubmit}
          >
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="name">name</Label>
                  <Input
                    id="name"
                    type="name"
                    value={name}
                    placeholder="name"
                    onChange={(e)=>setName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="username">username</Label>
                  <Input
                    id="username"
                    type="username"
                    value={username}
                    onChange={(e)=>setUsername(e.target.value)}
                    placeholder="username"
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                    placeholder="@example.com"
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input id="password" type="password"
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  required />
                </div>
                <Button type="submit" className="w-full">
                  Signup
                </Button>
              </div>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <a href="/login" className="underline underline-offset-4">
                  Login
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
