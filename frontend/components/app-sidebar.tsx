"use client"

import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
    useSidebar,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { MessageSquareMore, FolderOpen, Settings, MoreVertical } from "lucide-react"
import { Logo } from "./logo"
import { useRouter } from "next/navigation"
import React from "react"
import { useChatsContext } from "@/context/chatsContext"
import { useSourcesContext } from "@/context/SourceContext"
import { useIsRestoring } from "@tanstack/react-query"
import ChatSkeletonComponent from "./ChatSkeletonComponent"
import ChatsAction from "./ChatsAction"


export function AppSidebar() {
    const router = useRouter()
    const { state, open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar } = useSidebar()
    const { useChatsInfinite, setMessages, activeChat, setActiveChat, getMessagesAndSource} = useChatsContext()
    const { setSelectedSources } = useSourcesContext()


    const isRestoring = useIsRestoring()

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useChatsInfinite()

    const handleScroll = (e: React.UIEvent<HTMLUListElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 20) {
            if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage()
            }
        }
    }

    const headerOnClick = (e: any) => {
        e.preventDefault()
        router.push("/")
    }

    const newChatOnClick = (e: any) => {
        e.preventDefault()
        setActiveChat(null)
        setSelectedSources([]);
        setMessages([]);
        router.push("/chat")
    }

    const sourceOnClick = (e: any) => {
        e.preventDefault()
        setActiveChat(null)
        router.push("/sources")
    }

    const specificChatOnClick = (id: string) => {
        if (id === activeChat) return;
        router.push(`/chat/${id}`)
        setMessages([]);
        setActiveChat(id);
        getMessagesAndSource(id);
    }

    return (
        <>
            <Sidebar side="left" variant="sidebar" collapsible="icon">

                <SidebarHeader className="group flex h-12 px-2">
                    {state === "expanded" && open ? (
                        <div className="flex w-full items-center justify-between">

                            <div className="cursor-pointer" onClick={headerOnClick}>
                                <Logo showName={false} size="sm" />
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <SidebarTrigger />
                            </div>
                        </div>
                    ) : (

                        <div className="flex w-full">

                            <div className="group-hover:hidden">
                                <Logo showName={false} size="sm" />
                            </div>
                            <div className="hidden group-hover:block">
                                <SidebarTrigger />
                            </div>
                        </div>
                    )}
                </SidebarHeader>

                <SidebarContent className="flex flex-col h-full overflow-hidden">
                    <SidebarGroup className="flex-none">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="New Chat" onClick={newChatOnClick} size={"sm"}  >
                                    <MessageSquareMore size={10} />
                                    <span>New Chat</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Source" onClick={sourceOnClick} >
                                    <FolderOpen />
                                    <span>Source</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroup>

                    <SidebarGroup className="flex flex-col min-h-0 px-0">

                        <SidebarGroupLabel>Chats</SidebarGroupLabel>

                        <SidebarMenu
                            className="overflow-y-auto scrollbar-thin flex-1 p-1"
                            onScroll={handleScroll}
                        >

                            {(isRestoring || status === 'pending' && !data) ? (
                                <>
                                    {[...Array(6)].map((_, i) => (
                                        <SidebarMenuItem key={i}>
                                            <ChatSkeletonComponent key={i} />
                                        </SidebarMenuItem>
                                    ))}
                                </>
                            ) : (
                                <>
                                    {data?.pages.map((page, i) => (
                                        <React.Fragment key={i}>
                                            {page.chats.map((chat: any) => (
                                                <SidebarMenuItem key={chat._id}>
                                                    {open && (
                                                        <SidebarMenuButton
                                                            asChild
                                                            onClick={() => specificChatOnClick(chat._id)}
                                                            isActive={activeChat === chat._id}
                                                            aria-expanded="false"
                                                            className={`group/chat flex items-center justify-between ${activeChat === chat._id ? "bg-black border-2" : ""
                                                                }`}
                                                        >
                                                            <div
                                                                onClick={() => specificChatOnClick(chat._id)}
                                                                className="flex w-full items-center justify-between cursor-pointer"
                                                            >
                                                                <span className="truncate">{chat.title}</span>
                                                                <ChatsAction chatId={chat._id}/>
                                                            </div>
                                                        </SidebarMenuButton>
                                                    )}
                                                </SidebarMenuItem>
                                            ))}
                                        </React.Fragment>
                                    ))}


                                    {isFetchingNextPage && (
                                        <>
                                            {[...Array(3)].map((_, i) => (
                                                <SidebarMenuItem key={`next-${i}`}>
                                                    <ChatSkeletonComponent />
                                                </SidebarMenuItem>
                                            ))}
                                        </>
                                    )}
                                </>
                            )}
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>


                <SidebarFooter className="border-t">
                    <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Settings">
                            <Settings />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarFooter>
            </Sidebar>
        </>
    )
}