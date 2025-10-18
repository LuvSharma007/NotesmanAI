"use client"

import { SourcePanel } from "@/components/sourcePanel"
import { ChatInterface } from "@/components/chatInterface"
import { useParams , useRouter } from "next/navigation"

export default function dashboardPage() {
  const {fileId} =useParams<{fileId:string}>()
  const router = useRouter()

  if (!fileId) {
    router.push("/c")
    throw new Error("No fileID found in URL")
  }

  return (
    <div className="flex h-screen bg-background">
      <SourcePanel
      onSourceSelect={(src)=>router.push(`/c/${src._id}`)}
      onSourceDelete={()=>router.push(`/c`)} 
      />
      <ChatInterface fileId={fileId}/>
    </div>
  )
}

