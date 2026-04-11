"use client"
import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Button } from './ui/button'
import { authClient, signOut } from '@/lib/auth-client'
import Link from 'next/link'
import { ModeToggle } from './modeToogle'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ChartColumnBig, Settings, Wallet } from 'lucide-react'
import UserInfoDialog from './UserInfoDialog'


const Header = () => {
  const { data: session } = authClient.useSession()
  const router = useRouter()
  const pathname = usePathname()  
  const [isDialopOpen,setIsDialogOpen] = useState(false)

  const openSettings = (hash:string)=>{
    setIsDialogOpen(true);
    window.history.pushState(null,'',`#settings${hash}`)
  }

  const handleLogout = async () => {
    try {
      if (session) {
        await signOut();
        router.push("/login")
        toast.success("Logout successfully")
      } else {
        toast.error("No user found to logout")
      }
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  return (
    <>
      <div className='flex justify-between items-center px-6 h-14 w-full shrink-0 border-b bg-background'>
        <div className='flex items-center gap-2'>
          <h1 className='font-semibold text-lg'>
            {pathname === "/chat" ? "New Chat" : "Sources"  }
          </h1>
        </div>
        <div className='mr-3 flex gap-2'>
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 focus-visible:ring-0 focus-visible:ring-offset-0">
                  <Avatar className='h-8 w-8'>
                    <AvatarImage src={session?.user?.image || undefined} />
                    <AvatarFallback>
                      {session?.user.name.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className='text-sm font-medium select-none'>{session?.user?.username || session?.user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40" align='end'>
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={()=>openSettings(``)} >
                    <Settings/> Settings
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={()=>openSettings(`/subscription`)} >
                    <Wallet/> Subscription
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={()=>openSettings(`/usage`)} >
                    <ChartColumnBig/> Usage
                  </DropdownMenuItem>

                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem variant="destructive" onClick={handleLogout}>Log out</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
              <div>
                <ModeToggle/>
              </div>
            </DropdownMenu>
            
          ) : (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href="/signup">Signup</Link>
              </Button>
              <Button asChild size="sm" className="w-[80px] ml-2">
                <Link href="/login">Login</Link>
              </Button>
            </>
          )}
        </div>        
      </div>
      <UserInfoDialog
      isOpen={isDialopOpen}
      onClose={setIsDialogOpen}
      />
    </>
  )
}

export default Header