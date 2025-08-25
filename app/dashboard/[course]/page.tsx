"use client"

import { useState } from "react"
import { SourcePanel } from "@/components/source-panel"
import { ChatInterface } from "@/components/chat-interface"

interface Source {
  id: string
  name: string
  type: "pdf" | "docx" | "txt"
  uploadDate: string
  size: string
}

export default function NotebookLMPage() {
  const [selectedSource, setSelectedSource] = useState<Source | null>(null)

  const handleSourceSelect = (source: Source) => {
    setSelectedSource(source)
  }

  return (
    <div className="flex h-screen bg-background">
      <SourcePanel onSourceSelect={handleSourceSelect} />
      <ChatInterface selectedSource={selectedSource} />
    </div>
  )
}
