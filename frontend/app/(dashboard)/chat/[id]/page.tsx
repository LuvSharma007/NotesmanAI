"use client"
import ChatComponent from "@/components/ChatComponent";
import InputField from "@/components/InputField";

export default function ChatDetailPage() {
  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-y-auto w-full">
        <div className="max-w-3xl mx-auto w-full">
          <ChatComponent/>
        </div>
      </div>
      
      <div className="flex-shrink-0 w-full bg-background pb-2">
        <InputField />
      </div>
    </div>
  )
}
