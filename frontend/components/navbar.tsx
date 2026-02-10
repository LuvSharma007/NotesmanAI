'use client'
import React, { useEffect, useState } from 'react'
import { Menu, X, User, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'
import { Logo } from './logo'
import { Button } from './ui/button'
import { ModeToggle } from './modeToogle'
import { Spinner } from './ui/shadcn-io/spinner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import axios from "axios"
import { signOut } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'


const Navbar = () => {
  
  
  const [menuState, setMenuState] = React.useState(false)
  
  const menuItems = [
    { name: 'Chat', href: '/c' },
    { name: 'Features', href: "/#features" },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'ContactUs', href: '/contactUs' },
  ]
  const [session,setSession]= useState<any>(null);
  const [isPending,setIsPending] = useState(true);
  const router = useRouter()

  useEffect(()=>{
    const getUser = async ()=>{
      try {
        const { data } = await axios.get(`http://localhost:4000/api/me`, {
          withCredentials: true,
        });
        // console.log(data);
        
        setSession(data);
      } catch (err) {
        setSession(null);
      } finally {
        setIsPending(false);
      }
    };
    getUser()
  },[])

  const handleLogout = async()=>{
    try {
      if(session){
        await signOut();
        setSession(null)
        router.push("/login")
        toast.success("Logout successfully")
      }else{
        console.log("No user found to logout , please login again");
      }
    } catch (error) {
      console.log("Error logout user and clearing local user",error);
    }
  }

  return (
    <header>
      <nav
        data-state={menuState && 'active'}
        className="fixed z-20 w-full border-b border-dashed bg-white backdrop-blur md:relative dark:bg-zinc-950/50 lg:dark:bg-transparent"
      >
        <div className="m-auto max-w-5xl px-6">
          <div className="flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <Link href="/" aria-label="home" className="flex items-center space-x-2">
                <Logo />
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState === true ? 'Close Menu' : 'Open Menu'}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>
            </div>

            
            <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              
              <div className="lg:pr-4">
                <ul className="space-y-6 text-base lg:flex lg:gap-8 lg:space-y-0 lg:text-sm">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-accent-foreground block duration-150"
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
                
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:border-l lg:pl-6">
  
                {isPending ? (
                  <Button size="sm" disabled className="flex w-[80px] justify-center items-center gap-2">
                    <Spinner />
                  </Button>
                ) : session?.user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="cursor-pointer">
                        <AvatarImage
                          src={session.user?.image ?? "https://i.pinimg.com/1200x/7b/ec/3f/7bec3f90706e02d22aec14f25e578e63.jpg"}
                        />
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="bottom" className="w-40">
                      <DropdownMenuItem asChild>
                        <Link href="/profile">
                          <User className="mr-2 h-4 w-4" /> Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings">
                          <Settings className="mr-2 h-4 w-4" /> Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/signup">Signup</Link>
                    </Button>
                    <Button asChild size="sm" className="w-[80px]">
                      <Link href="/login">Login</Link>
                    </Button>
                  </>
                )}
              </div>

                <ModeToggle/>
            </div>
          </div>
          </div>
      </nav>
    </header>
  )
}

export default Navbar
