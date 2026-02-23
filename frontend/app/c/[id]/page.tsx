"use client"

import { ChatInterface } from "@/components/chatInterface"
import { useParams, useSearchParams  } from "next/navigation"
import { useEffect, useState } from "react"

export default function Page() {
  const {id} = useParams<{id:string}>()
  const searchParams = useSearchParams()
  const sourceType = searchParams.get(`sourceType`) as "file" | "url"
  const name = searchParams.get('name') || ""
  const [fileStatus,setFileStatus] = useState("pending")

  useEffect(()=>{
    if(!id || fileStatus === "completed") return;

    const checkStatus = async ()=>{
      const res = await fetch(`/api/v1/users/file-status/${id}`);
      const data = await res.json();
      setFileStatus(data.status);

      if(["pending","processing","chunking"].includes(data.status)){
        const eventSource = new EventSource(`/api/users/status/${id}`,{
            withCredentials:true
          })
        eventSource.onmessage = (event) =>{
          const sseData = JSON.parse(event.data)
          setFileStatus(sseData.status);
          console.log(sseData.status);

          if(sseData.status === "completed" || sseData.status === "failed"){
            console.log(sseData.status);
            setFileStatus(sseData.status)
            eventSource.close();
          }
        }
        return ()=> eventSource.close()
      }
    }
    checkStatus();
  },[id])


  return (
    <ChatInterface id={id} sourceType={sourceType} name={name} status={fileStatus}/>
  )
}

