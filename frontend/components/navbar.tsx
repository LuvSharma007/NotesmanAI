'use client'
import React from 'react'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { Logo } from './logo'
import { ModeToggle } from './modeToogle'
import { SiGithub } from "react-icons/si";
import { authClient, signOut } from '@/lib/auth-client'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const Navbar = () => {

  const [menuState, setMenuState] = React.useState(false)
  const { data: session } = authClient.useSession()
  const router = useRouter()

  const menuItems = [
    { name: 'Chat', href: '/chat' },
    { name: 'Features', href: "/#features" },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'ContactUs', href: '/contactUs' },
  ]

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
              <div className='flex gap-2'>
                {session ? (
                  <>
                    <Button
                      size="sm"
                      className="w-[80px]"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </>
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


              <Link
                href="https://github.com/LuvSharma007/NotesmanAI"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:border-l lg:pl-6 cursor-pointer">
                <SiGithub size={20} />
                {/* <span className='text-sm'>14.5K</span> */}
              </Link>
              <ModeToggle />
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
