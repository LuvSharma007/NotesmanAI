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
import { useState } from "react"
import { useRouter } from "next/navigation"
import {toast} from 'sonner'
import { Spinner } from "./ui/shadcn-io/spinner"
import { authClient } from "@/lib/auth-client"

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const [name , setName] = useState("")
  const [username , setUsername] = useState("")
  const [email , setEmail] = useState("")
  const [password , setPassword] = useState("")
  const [loading , setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e:React.FormEvent)=>{
    e.preventDefault();
    setLoading(true)
    try {
      
      const {data:response, error:usernameError} = await authClient.isUsernameAvailable({
        username,
      })
      if(usernameError){
        toast.error("Failed to check username availability")
        console.error("Username check error:", usernameError);
        return;
      }

      if (!response?.available) {
      toast.error("Username is already taken");
      console.log("User name is already taken");
      setLoading(false);
      return;
      }
      
      const {data,error} = await authClient.signUp.email({
        email,
        name,
        password,
        username
      })
      if(data){
        router.push("/login")
        console.log("User signup successfully",data);
        toast.success("Signup successfully")
      }else{
        console.log("Error signup user",error);
        toast.error(error?.message || "Signup failed")        
      }
    } catch (error) {
      setLoading(false)
      console.log("Error signup user",error);
      toast.error("Something went wrong")        
    }finally{
      setLoading(false)
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
          onSubmit={handleSignup}
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
                  </div>
                  <Input id="password" type="password"
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  required />
                </div>
                <Button type="submit" className="w-full">
                  {loading ? <Spinner/> : "Signup"}
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
