"use client"

import { useRouter } from "next/navigation"
import { SourcePanel } from "@/components/sourcePanel"
import { ChatInterface } from "@/components/chatInterface"
import { useState } from "react"

export default function DashboardPage() {
  const [activeFileId, setActiveFileId] = useState<string | null>(null)
  const [activeFileName, setActiveFileName] = useState<string | null>(null)

  const router = useRouter()

  return (
    <div className="flex h-screen bg-background">
      <SourcePanel
        onSourceSelect={(src) => {
          setActiveFileId(src._id)
          setActiveFileName(src.name)
          router.push(`/c/${src._id}`)
        }}
        onSourceDelete={() => {
          setActiveFileId(null)
          setActiveFileName(null)
          router.push(`/c`)
        }}
      />

      <div className="flex flex-1">
        {activeFileId ? (
          <ChatInterface fileId={activeFileId ?? undefined} fileName={activeFileName ?? undefined} />
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            Select a file to start chatting
          </div>
        )}
      </div>
    </div>
  )
}
