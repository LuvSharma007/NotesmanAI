"use client"

import { ChatInterface } from "@/components/chatInterface"
import { useParams, useSearchParams  } from "next/navigation"

export default function Page() {
  const {id} = useParams<{id:string}>()
  const searchParams = useSearchParams()
  const sourceType = searchParams.get(`sourceType`) as "file" | "url"
  const name = searchParams.get('name') || ""
  return (
    <ChatInterface id={id} sourceType={sourceType} name={name}/>
  )
}

