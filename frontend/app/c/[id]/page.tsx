"use client"

import { ChatInterface } from "@/components/chatInterface"
import { useParams, useSearchParams  } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function Page() {
  const {id} = useParams<{id:string}>()
  const searchParams = useSearchParams()
  const sourceType = searchParams.get(`sourceType`) as "file" | "url"
  const name = searchParams.get('name') || ""
  const [fileStatus,setFileStatus] = useState("pending")

  useEffect(()=>{
    try {
    if(!id) return;

    const controller = new AbortController();
    let eventSource: EventSource | null = null

    const checkStatus = async ()=>{
      const res = await fetch(`/api/v1/users/file-status/${id}`,{
        signal:controller.signal
      });
      
      const data = await res.json();
      if(data.status === 'completed') return;
      
      setFileStatus(data.status);

      if(["pending","processing","chunking","completed","failed"].includes(data.status)){
        eventSource = new EventSource(`/api/v1/users/status/${id}`,{
            withCredentials:true
          })

        eventSource.onmessage = (event) =>{
          const sseData = JSON.parse(event.data)
          setFileStatus(sseData.status);

          if(sseData.status === "completed" || sseData.status === "failed"){
            eventSource?.close();
          }
        }
      }
    }
    checkStatus();

    return ()=>{ 
      toast.success(`You can now chat with ${name}`)
      controller.abort();
      eventSource?.close()
    }
    } catch (error) {
      console.log("something went wrong",error);
      toast.error("something went wrong")
    }
    
  },[id])


  return (
    <ChatInterface id={id} sourceType={sourceType} name={name} status={fileStatus}/>
  )
}

