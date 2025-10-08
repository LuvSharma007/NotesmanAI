"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, MessageSquare, ArrowRight } from "lucide-react";

interface Message {
  id: string;
  content: string |null;
  sender: "user" | "ai";
  timestamp: Date;
}

export function ChatInterface({
  fileId,
  messages: initialMessages = [],
}: {
  fileId?: string;
  messages?: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [threadId , setThreadId] = useState<string | null>(null);
  // const messages = useQuery(api.messages.list, { threadId });
  

  return (
    <div className="flex-col h-full flex-1 flex overflow-hidden">
      <Card className="flex-1 flex flex-col ml-5 border border-border overflow-hidden bg-background">
        <CardHeader className="border-b border-border flex-shrink-0">
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            {fileId ? (
              <span>Chat with your source</span>
            ) : (
              <span className="text-sm text-muted-foreground">
                Please select a source to chat
              </span>
            )}
          </CardTitle>
        </CardHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Messages */}
          <ScrollArea className="flex-1 p-6 min-h-0 pb-2">
            <div className="space-y-4 mb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.sender === "user"
                      ? "justify-end"
                      : "justify-start"
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
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
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
                placeholder="Ask questions about your sources..."
                className="flex-1 h-10"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter"}
              />
              <Button size="sm" className="mt-0.5">
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
