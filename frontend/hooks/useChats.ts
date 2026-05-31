import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react'
import { toast } from 'sonner';
import { useSourcesContext } from '@/context/SourceContext';
import { useParams, useRouter } from 'next/navigation';
import { Source } from './useSources';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

interface Message {
    _id: string;
    role: "user" | "assistant" | "thinking"
    content: string;
}

interface MessageResponse {
    _id: string,
    role: "user" | "assistant" | "thinking"
    content: string,
}

export const useChats = () => {

    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([])
    const [isThinking,setIsThinking] = useState(false);

    const [activeChat, setActiveChat] = useState<string | null>(null)
    const params = useParams();
    const currentActiveId = params.id
    // console.log("currentActiveId:",currentActiveId);


    const { selectedSources, setSelectedSources } = useSourcesContext()
    const router = useRouter()
    const queryClient = useQueryClient();

    const doChat = async (conversationID: string,isWebSearch:boolean) => {

        const trimmedInput = input.trim();
    if (!trimmedInput) {
        return;
    }

    setIsLoading(true);

    const userMsgId = uuidv4();
    const thinkingMsgId = uuidv4();
    const assistantMsgId = uuidv4();

    const userMessage: Message = {
        _id: userMsgId,
        content: trimmedInput,
        role: "user"
    };

    setInput("");

    setMessages((prevHistory) => [
        ...prevHistory,                                         
        userMessage,                                            
        { _id: thinkingMsgId, content: "", role: "thinking" },  
        { _id: assistantMsgId, content: "", role: "assistant" }
    ]);

    const sourceIdsPayload = {
        sources: selectedSources.map(s => ({
            sourceId: s._id,
            sourceType: s.sourceType,
        }))
    };
        const isNewChat = !conversationID || conversationID === "new";
        const idToSend = conversationID && conversationID !== "undefined" ? conversationID : "new";

        setIsThinking(true)
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
                    isWebSearch
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

            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                // Split by double newline to separate SSE frames safely
                let boundary = buffer.indexOf("\n\n");

                while (boundary !== -1) {
                    const rawEvent = buffer.slice(0, boundary).trim();
                    buffer = buffer.slice(boundary + 2);

                    // Initialize clean payload data placeholder
                    let eventData = "";

                    // Parse out only lines beginning with 'data: '
                    const lines = rawEvent.split("\n");
                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            // Concatenate data content just in case an event spans multiple data lines
                            eventData += line.slice(6).trim();
                        }
                    }

                    if (eventData) {
                        try {
                            const payload = JSON.parse(eventData);
                            // Safely pull your data schema out
                            const message = payload.json;

                            if (message && message.type) {
                                switch (message.type) {
                                    case "reasoning-delta": {
                                        setIsThinking(true);
                                        const chunk = message.delta ?? "";
                                        setMessages((prev) =>
                                            prev.map((msg) =>
                                                msg.role === "thinking"
                                                    ? { ...msg, content: (msg.content || "") + chunk }
                                                    : msg
                                            )
                                        );
                                        break;
                                    }

                                    case "text-delta": {
                                        setIsThinking(false)
                                        const chunk = message.delta ?? "";
                                        setMessages((prev) =>
                                            prev.map((msg) =>
                                                msg.role === "assistant"
                                                    ? { ...msg, content: (msg.content || "") + chunk }
                                                    : msg
                                            )
                                        );
                                        break;
                                    }
                                    default:
                                        break;
                                }
                            }
                        } catch (err) {
                            console.error("Failed to parse clean SSE payload:", err, "Raw Data:", eventData);
                        }
                    }

                    // Refresh boundary tracking for the next event in this chunk sequence
                    boundary = buffer.indexOf("\n\n");
                }
            }
        } finally {
            setIsLoading(false);
            setIsThinking(false);
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
            console.log("messagesData:", messagesData);
            console.log("sourceType:", sourceData);

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

        if (chatId === currentActiveId) {
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
            setMessages([]);
            toast("chat deleted successfully")

        } catch (error) {
            toast.error("Something went wrong while deleting chat")
        }

    }

    const renameChat = async () => {
        toast.message("feature coming soon")
    }

    const shareChat = async () => {
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
        shareChat,
        isThinking
    }
}