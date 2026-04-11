"use client"
import { createContext, useContext } from "react"
import { useSource } from "@/hooks/useSources"

type SourcesContextType = ReturnType<typeof useSource>

const SourcesContext = createContext<SourcesContextType | undefined>(undefined)

export const SourcesProvider = ({ children }: { children: React.ReactNode }) => {
  const sourceState = useSource()

  return (
    <SourcesContext.Provider value={sourceState}>
      {children}
    </SourcesContext.Provider>
  )
}

export function useSourcesContext(): SourcesContextType {
  const context = useContext(SourcesContext)

  if (!context) {
    throw new Error("useSourcesContext must be used inside SourcesProvider")
  }

  return context
}