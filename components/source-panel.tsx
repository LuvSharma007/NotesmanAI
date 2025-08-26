"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Upload, X } from "lucide-react"
import axios from "axios"
import { Spinner } from "./ui/shadcn-io/spinner"

interface Source {
  id: string
  name: string
  type: "pdf" | "docx" | "txt"
  uploadDate: string
  size: string
}

interface SourcePanelProps {
  onSourceSelect: (source: Source) => void
}

export function SourcePanel({onSourceSelect}:SourcePanelProps){
  const [sources , setSources] = useState<Source[]>([])
  const [loading , setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string[]>([])


  // get all collections

  useEffect(() => {
  const fetchCollections = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/getAllCollections");

      if (res.data.success) {
        const collections = res.data.collections || [];

        const mappedSources: Source[] = collections.map((col: any) => ({
          id: col._id,
          name: col.fileName,
          type: col.fileType,
          uploadDate: col.uploadedAt,
          size: col.fileSize
        }));

        setSources(mappedSources);
      }
    } catch (error:any) {
      if (error.response?.status === 404) {
        setSources([]);
      } else {
        console.log("Error fetching collections:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  fetchCollections();
}, []);





  // HandleFileUpload

  const handleFileUpload = async (event:React.ChangeEvent<HTMLInputElement>)=>{
    const files = event.target.files
    if(!files || files.length === 0) return

    const formData = new FormData()
    for(const file of Array.from(files)){
      formData.append("files",file)
    }

    try {
      setLoading(true)

      const res = await axios.post(`/api/upload`,formData,{
        headers:{
          "Content-Type":"multipart/form-data",
        }
      })

      if(res.data.success && res.status === 200){
        const newSources: Source[] = Array.from(files).map((file) => ({
          id: Date.now().toString() + file.name,
          name: file.name,
          type: file.name.split(".").pop() as "pdf" | "docx" | "txt",
          uploadDate: new Date().toISOString(),
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        }))
        setSources((prev)=>[...prev,...newSources])
        console.log("Uploaded",res.data);
      }else{
        console.log("Uploaded Failed:",res.data.error || res.data.message);
      }
    } catch (error) {
      console.log("Uploaded Failed:",error);
    }finally{
      setLoading(false)
    }
  }

  // Remove a source 

  const removeSource = async (name:string)=>{
    setDeleting((prev) => [...prev, name])
    try {
      const collectionName = `${name.split(".")[0]}_collection`
      await axios.delete("/api/delete",{
        data:{fileName:name},
      })
      setSources((prev)=>prev.filter((s)=> s.name !== name))
      console.log("deleted",collectionName);      
    } catch (error) {
      console.log("Error Deleteing File",error);
    }finally{
            setDeleting((prev) => prev.filter((n) => n !== name))
    }
  }
   
  return (
    <div className="w-80 bg-card border-r h-177 flex flex-col rounded-2xl mb-5">
      <div className="p-6 border-b">
        <h1 className="text-xl font-semibold mb-4">Dashboard</h1>

        {/* Upload Area */}
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center justify-center py-3 border-2 border-dashed border-muted-foreground/25 rounded-lg">
            {loading ? <Spinner className="h-6 w-6" /> : <Upload className="h-6 w-6 text-muted-foreground mb-1" />}
            <p className="text-xs text-foreground text-center">
              {sources.length >= 1 ? "Remove existing file to upload new one" : "Drop file or click to upload"}
            </p>
            <p className="text-xs text-muted-foreground">PDF, DOCX, TXT</p>
          </div>
        </label>
        <input
          id="file-upload"
          type="file"
          multiple={false}
          disabled={sources.length >= 1}
          accept=".pdf,.docx,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Sources List */}
      <div className="flex-1 overflow-y-auto p-6">
        <h2 className="text-sm font-medium mb-3">Sources</h2>
        <div className="space-y-2">
          {sources.map((source) => (
            <CardContent key={source.id} className="p-2 rounded border-2">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2 flex-1" onClick={() => onSourceSelect(source)}>
                  <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{source.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary" className="text-xs">{source.type.toUpperCase()}</Badge>
                      <span className="text-xs text-muted-foreground">{source.size}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(source.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); removeSource(source.name) }}
                  className="h-6 w-6 p-0 text-muted-foreground flex items-center justify-center"
                >
                  {deleting.includes(source.name) ? <Spinner className="h-3 w-3" /> : <X className="h-3 w-3" />}
                </Button>
              </div>
            </CardContent>
          ))}
        </div>
      </div>
    </div>
  )
}

