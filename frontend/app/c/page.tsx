"use client"

import { useRouter } from "next/navigation"
import { SourcePanel } from "@/components/sourcePanel"
import { ChatInterface } from "@/components/chatInterface"
import { useState } from "react"

export default function DashboardPage() {
  const [activeFileId, setActiveFileId] = useState<string | null>(null)
  const router = useRouter()

  return (
    <div className="flex h-screen bg-background">
      <SourcePanel
        onSourceSelect={(src) => {
          setActiveFileId(src.id)
          router.push(`/c/${src.id}`)  // ✅ navigate into [fileId]
        }}
        onSourceDelete={() => {
          setActiveFileId(null)
          router.push(`/c`)
        }}
      />

      <div className="flex flex-1">
        {activeFileId ? (
          <ChatInterface fileId={activeFileId} />
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            Select a file to start chatting
          </div>
        )}
      </div>
    </div>
  )
}
