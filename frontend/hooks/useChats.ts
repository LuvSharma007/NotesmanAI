import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react'
import { toast } from 'sonner';
import { useSourcesContext } from '@/context/SourceContext';
import { useParams, useRouter } from 'next/navigation';
import { Source } from './useSources';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

interface Message {
    _id: string;
    role: "user" | "assistant"
    content: string;
}

interface MessageResponse {
    _id: string,
    role: "user" | "assistant",
    content: string,
}

export const useChats = () => {

    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([])

    const [activeChat, setActiveChat] = useState<string | null>(null)
    const params = useParams();
    const currentActiveId = params.id
    // console.log("currentActiveId:",currentActiveId);
    

    const { selectedSources, setSelectedSources } = useSourcesContext()
    const router = useRouter()
    const queryClient = useQueryClient();

    const doChat = async (conversationID: string) => {

        const trimmedInput = input.trim();
        if (!trimmedInput) {
            return;
        }

        setIsLoading(true)

        const userMessage: Message = {
            _id: uuidv4(),
            content: trimmedInput,
            role: "user"
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");

        const aiMessage: Message = {
            _id: uuidv4(),
            content: "",
            role: "assistant"
        }
        setMessages((prev) => [...prev, aiMessage])

        const sourceIdsPayload = {
            sources: selectedSources.map(s => ({
                sourceId: s._id,
                sourceType: s.sourceType,
            }))
        }
        const isNewChat = !conversationID || conversationID === "new";
        const idToSend = conversationID && conversationID !== "undefined" ? conversationID : "new";

        try {
            const res = await fetch(`/api/v1/userchats/c/${idToSend}?isNewChat=${isNewChat}`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: trimmedInput,
                    sourceIds: sourceIdsPayload,
                })
            })

            if (!res.body) {
                console.log("No response body received from the stream");
                return;
            }

            const convId = res.headers.get('X-Conversation-Id')
            // console.log("ConvId:", convId);

            if (convId && isNewChat) {
                const newChat = {
                    _id: convId,
                    title: trimmedInput.substring(0, 30)
                }

                // pushing the newly chat into localstorage 
                queryClient.setQueryData(['chats'], (oldData: any) => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
                        pages: oldData.pages.map((page: any, index: number) => {
                            if (index === 0) {
                                return {
                                    ...page,
                                    chats: [newChat, ...page.chats]
                                }
                            }
                            return page;
                        })
                    }
                })
                setActiveChat(convId);
                router.push(`/chat/${convId}`)
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });

                setMessages((prevMessages) => {
                    return prevMessages.map((msg) => {
                        if (msg._id === aiMessage._id) {
                            return { ...msg, content: (msg.content || "") + chunk }
                        }
                        return msg;
                    })
                })
            }


        } catch (error) {

            console.error("Error generating response", error);
            toast.error("Opps , something went wrong");
            setMessages((prev) =>
                prev!.map((msg) =>
                    msg._id === aiMessage._id ? { ...msg, content: "Error: Failed to fetch response." } : msg
                )
            );
        } finally {
            setIsLoading(false);
        }
    }

    const useChatsInfinite = () => {
        return useInfiniteQuery({
            queryKey: ['chats'],
            queryFn: async ({ pageParam = 0 }) => {
                const res = await fetch(`/api/v1/userMessages/getAllChats?skip=${pageParam}`)
                if (!res.ok) throw new Error("Error fetching chats")
                return res.json()
            },
            initialPageParam: 0,
            getNextPageParam: (lastPage) => lastPage.nextSkip ?? undefined,
        })
    }

    const getMessagesAndSource = async (conversationId: string) => {
        setIsLoading(true)
        try {
            const [messageResponse, sourcesResponse] = await Promise.all([
                fetch(`/api/v1/userMessages/getAllMessages?conversationId=${conversationId}`, { credentials: "include" }),
                fetch(`/api/v1/userMessages/getAllSources?conversationId=${conversationId}`, { credentials: "include" })
            ])
            // console.log("messagesResponse:",messageResponse);
            // console.log("sourceResponse:",sourcesResponse);


            if (!messageResponse.ok) {
                const errorData = await messageResponse.json();
                toast.error(errorData.message || "Something went wrong")
                return;
            }

            if (!sourcesResponse.ok) {
                const errorData = await sourcesResponse.json();
                toast.error(errorData.message || "Something went wrong")
                return;
            }

            const messagesData = await messageResponse.json()
            const sourceData = await sourcesResponse.json()
            // console.log("messagesData:",messagesData);
            // console.log("sourceType:",sourceData);

            if (messagesData.success && sourceData.success &&
                messagesData.messages.length === 0 && sourceData.sources.length === 0
            ) {
                return;
            }

            const messages: MessageResponse[] = messagesData.messages.map((msg: MessageResponse) => ({
                _id: msg._id,
                role: msg.role,
                content: msg.content
            }))
            setMessages(messages)

            const sources: Source[] = sourceData.sources.map((source: Source) => ({
                _id: source._id,
                name: source.name,
                sourceType: source.sourceType,
            }))
            setSelectedSources(sources)

        } catch (error) {
            toast.error("Error fetching messages");
        } finally {
            setIsLoading(false)
        }
    }

    const deleteChat = async ({ chatId }: { chatId: string }) => {
        
        queryClient.setQueryData(['chats'], (oldData: any) => {
            if (!oldData) return oldData;
            return {
                ...oldData,
                pages: oldData.pages.map((page: any) => ({
                    ...page,
                    chats: page.chats.filter((chat: any) => chat._id !== chatId)
                }))
            };
        });

        if(chatId === currentActiveId){
            router.replace('/chat')
        }

        try {
            const res = await fetch(`/api/v1/userChats/deleteChat?chatId=${chatId}`, {
                method: "DELETE",
                credentials: "include"
            })
            if (!res.ok) {
                toast.error("something went wrong")
            }
            toast("chat deleted successfully")

        } catch (error) {
            toast.error("Something went wrong while deleting chat")
        }

    }

    const renameChat = async ()=>{
        toast.message("feature coming soon")        
    }

    const shareChat = async ()=>{
        toast.message("feature coming soon")        
    }

    return {
        doChat,
        messages,
        isLoading,
        input,
        setInput,
        getMessagesAndSource,
        useChatsInfinite,
        setActiveChat,
        activeChat,
        setMessages,
        deleteChat,
        renameChat,
        shareChat
    }
}