"use client"

import { SourcePanel } from "@/components/sourcePanel"
import { useRouter } from "next/navigation"

export default function ChatLayout({children}:{children:React.ReactNode}){
    const router = useRouter()
    return (
        <div className="flex h-screen bg-background">
            <SourcePanel
                onSourceSelect={(src)=>router.push(`/c/${src._id}?sourceType=${src.sourceType}&name=${encodeURIComponent(src.name)}`)}
                onSourceDelete={()=>router.push("/c")}
            />
            <div className="flex flex-1">
                {children}
            </div>
        </div>
    )
}