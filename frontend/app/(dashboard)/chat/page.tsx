"use client"
import Mainchat from "@/components/Mainchat";
import InputField from "@/components/InputField";
import { useSourcesContext } from "@/context/SourceContext";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { SourceComponent } from "@/components/SourceComponent";

export default function ChatPage() {

  const pathName = usePathname()
  const searchParams = useSearchParams()
  const sourceId = searchParams.get("source")
  const {sources , selectSource} = useSourcesContext()
  const router = useRouter()

    useEffect(()=>{
        if(!sourceId) return

        const source = sources.find((s)=> s._id === sourceId)        
        if(source){
          selectSource(source)
          router.replace("/chat")
        }
    },[sourceId,sources])
  
    const isChatPath = pathName === "/chat";

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-y-auto w-full">
        <div className="max-w-3xl mx-auto w-full">
          {isChatPath ? (
            <Mainchat />
          ): 
          <SourceComponent/>
          }
        </div>
      </div>
      
      <div className="flex-shrink-0 w-full bg-background">
        <InputField />
      </div>
    </div>
  )
}
