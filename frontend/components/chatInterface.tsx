"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, MessageSquare, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { Spinner } from "./ui/shadcn-io/spinner";

interface Message {
  id: string;
  content: string | null;
  sender: "user" | "ai";
}

export function ChatInterface({
  id,
  messages: initialMessages = [],
  sourceType,
  name,
  status
}: {
  id?: string;
  name?: string,
  sourceType:"file"|"url"
  messages?: Message[];
  status:string
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const isProcessing = ["pending","processing","chunking"]
  const isCurrentProcessing = isProcessing.includes(status)

  const handleChat = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || !id) {
      console.error("Input or FileId is missing");
      return;
    }

    const userMessage: Message = {
      id: uuidv4(),
      content: trimmedInput,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const aiMessage: Message = {
      id: uuidv4(),
      content: "",
      sender: "ai",
    };
    setMessages((prev) => [...prev, aiMessage]);

    try {
      const res = await fetch(`/api/v1/userchats/c/${id}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: trimmedInput,
          id,
          sourceType
        }),
      });

      if (!res.body) {
        console.error("No response body received from the stream.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        
        setMessages((prevMessages) => {
          return prevMessages.map((msg) => {
            if (msg.id === aiMessage.id) {
              return { ...msg, content: (msg.content || "") + chunk };
            }
            return msg;
          });
        });
      }
    } catch (error) {
      console.error("Error generating response", error);
      toast.error("Opps , something went wrong");
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessage.id ? { ...msg, content: "Error: Failed to fetch response." } : msg
        )
      );
    }
  };

  useEffect(()=>{
    if(!id) return;
    
    const getMessages = async ()=>{
      
      try {
        const res = await fetch(`/api/v1/userMessages/getAllMessages?id=${id}`,{
          method:"GET",
          credentials:"include",
        })

        const data = await res.json();

        if(data.success){
          const formatted = data.messages.map((msg:any)=>({
            id:msg._id,
            sender:msg.role,
            content:msg.content
          }));
          setMessages(formatted)
        }

      } catch (error) {
        toast.error("Error Fetching messages");
      }
    }
    getMessages();
  },[id])

  return (
    <div className="flex-col h-full flex-1 flex overflow-hidden">
      <Card className="flex-1 flex flex-col ml-5 border border-border overflow-hidden bg-background">
        <CardHeader className="border-b border-border flex-shrink-0">
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            {id ? (
              <span
              className="text-sm text-muted-foreground"
              >
              {name}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">
                Please select a source file or Url to start chat
              </span>
            )}
          </CardTitle>
        </CardHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {isCurrentProcessing && (
            <div>
              <Spinner className="h-10 w-10 mb-4 text-primary"/>
              <h3 className="text-lg fron-semibold capitalize">{status}....</h3>
            </div>
          )}

          <ScrollArea className="flex-1 p-6 min-h-0 pb-2">
            <div className="space-y-4 mb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.sender === "ai" && (
                    <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}

                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">
                      {message.content}
                    </p>
                  </div>

                  {message.sender === "user" && (
                    <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t border-border p-4 flex-shrink-0 bg-background/95 backdrop-blur-sm">
            <div className="flex space-x-2">
              <Input
                placeholder="Ask questions"
                className="flex-1 h-10"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleChat();
                  }
                }}
              />
              <Button size="sm" className="mt-0.5" onClick={handleChat}>
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
