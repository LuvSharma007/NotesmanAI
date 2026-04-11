"use client"
import { createContext, useContext } from "react"
import { useChats } from "../hooks/useChats"

type ChatsContextType = ReturnType<typeof useChats>

const ChatsContext = createContext<ChatsContextType | undefined>(undefined)

export const ChatsProvider = ({ children }: { children: React.ReactNode }) => {
  const chatsState = useChats()

  return (
    <ChatsContext.Provider value={chatsState}>
      {children}
    </ChatsContext.Provider>
  )
}

export function useChatsContext(): ChatsContextType {
  const context = useContext(ChatsContext)

  if (!context) {
    throw new Error("useSourcesContext must be used inside SourcesProvider")
  }

  return context
}