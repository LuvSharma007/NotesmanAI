"use client"

import { useState } from "react"
import { SourcePanel } from "@/components/sourcePanel"
import { ChatInterface } from "@/components/chatInterface"
import { useParams , useRouter } from "next/navigation"


export default function dashboardPage() {
  const {fileId} =useParams<{fileId:string}>()
  const router = useRouter()

  return (
    <div className="flex h-screen bg-background">
      <SourcePanel
      onSourceSelect={(src)=>router.push(`/dashboard/${src.id}`)}
      onSourceDelete={()=>router.push(`/dashboard`)} 
      />
      <ChatInterface fileId={fileId}/>
    </div>
  )
}

