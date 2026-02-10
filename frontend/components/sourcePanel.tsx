"use client"

import React, { useRef, useState, useEffect } from "react"
import { CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, FileText, Link2, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { Spinner } from "./ui/shadcn-io/spinner"


export interface Source {
  _id: string
  name: string,
  sourceType: "file" | "url"
}

interface FileResponse {
  _id: string;
  name: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  status?: string;
}

interface UrlResponse {
  _id: string,
  name: string
}


interface SourcePanelProps {
  onSourceSelect: (source: Source) => void
  onSourceDelete?: (deletedId: string) => void
}

export function SourcePanel({ onSourceSelect, onSourceDelete }: SourcePanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState("");

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) setFile(selectedFile)
  }

  // Auto upload when file changes
  useEffect(() => {
    if (!file) return
    const uploadFile = async () => {
      if (sources.length >= 3) {
        toast.error("Limit reached , max upload is 3")
        return
      }

      try {
        setLoading(true)
        const formData = new FormData()
        formData.append("file", file)

        // Example: Adjust this API endpoint to your backend route
        const res = await fetch(`http://localhost:4000/api/v1/users/upload`, {
          method: "POST",
          body: formData,
          credentials: "include"
        })
        const data = await res.json();

        if (!res.ok){
          toast.error(data.message || "An error occured")
          return;
        }

        const newSource: Source = {
          _id: data.file.id,
          name: data.file.name,
          sourceType: "file"
        }

        setSources((prev) => [...prev, newSource])

        toast.success("File uploaded successfully")
      } catch (err) {
        console.error("Failed to upload file", err)
        toast.error("Failed to upload file.")
      } finally {
        setLoading(false)
        setFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
      }
    }

    uploadFile()
  }, [file]) // runs automatically when file changes

  const handleDeleteFile = async (id: string, sourceType: "file" | "url") => {
    try {
      setDeleting((prev) => [...prev, id]);
      const res = await fetch(`http://localhost:4000/api/v1/users/delete-file/${id}?sourceType=${sourceType}`, {
        method: 'DELETE',
        credentials: "include",
      })
      if (!res.ok) {
        throw new Error("Failed to delete")
      }
      setSources((prev) => prev.filter((s) => s._id !== id))
      if (onSourceDelete) {
        onSourceDelete(id)
      }

      toast.success("File deleted");
    } catch (error) {
      toast.error("Error deleting file")
      console.log("error uploading file:", error);
    } finally {
      setDeleting((prev) => prev.filter((id) => id !== id))
    }
  }

  const handleUrlSubmit = async () => {
    try {
      if (!url) {
        toast.error("URL is required")
        return;
      }
      const res = await fetch(`http://localhost:4000/api/v1/url/uploadUrl`, {
        method: 'POST',
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })
      // console.log("Response:", res);


      if (!res.ok) {
        throw new Error("Error Scrape URL")
      }

      const data = await res.json()
      if (!data) throw new Error("Url processing Failed")

      const urlSource: Source = {
        _id: data.url.id,
        name: data.url.name,
        sourceType: "url"
      }

      setSources((prev) => [...prev, urlSource])
      setUrl("");
      // console.log("Sources:", sources);

      toast.success("URL processing successfull")
    } catch (error) {
      toast.error("Error Sending URl")
      console.log("error sendings URL:", error);
    }
  }

  useEffect(() => {
    const loadSources = async () => {
      try {
        const [allFiles, allUrls] = await Promise.all([
          fetch("http://localhost:4000/api/v1/users/get-files", { credentials: "include" }),
          fetch("http://localhost:4000/api/v1/url/getAllUrls", { credentials: "include" })
        ])

        const filesData = await allFiles.json()
        const urlsData = await allUrls.json()

        const files: Source[] = filesData.files.map((f: FileResponse) => ({
          _id: f._id,
          name: f.name,
          sourceType: "file"
        }));

        const urls: Source[] = urlsData.urls.map((u: UrlResponse) => ({
          _id: u._id,
          name: u.name,
          sourceType: "url"
        }))
        setSources([...files, ...urls])
        // console.log("Sources:", sources);

      } catch (error) {
        toast.error("Failed to load sources")
      }
    }
    loadSources();
  }, [])

  return (
    <div className="w-[280px] border-r border-border flex-shrink-0 rounded-2xl">
      {/* Header */}
      <div className="p-6 border-b">
        <h1 className="text-xl font-semibold mb-4">Dashboard</h1>

        {/* Upload Area */}
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center justify-center py-4 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:bg-muted/20 transition">
            {loading ? (
              <Spinner className="h-6 w-6 mb-1" />
            ) : (
              <Upload className="h-6 w-6 text-muted-foreground mb-1" />
            )}
            <p className="text-xs text-foreground text-center">
              {sources.length >= 3
                ? "You have reached your limit"
                : "Drop file or click to upload"}
            </p>
            <p className="text-xs text-muted-foreground">PDF, DOCX, TXT</p>
          </div>
        </label>
        <label>
          <div className="relative mt-2">
            <input
              type="text"
              placeholder="paste url here"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-2 py-3 pr-10 text-sm text-center
             border-2 border-dashed border-muted-foreground/25
             rounded-lg outline-none"
            />
            <button
              type="button"
              onClick={handleUrlSubmit}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <ArrowRight className="size-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        </label>

        <input
          id="file-upload"
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileSelect}
          // disabled={sources.length>=3}
        />

      </div>



      {/* Sources */}
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-sm font-medium mb-3">Sources</h2>
        {sources.length === 0 ? (
          <p className="text-xs text-muted-foreground">No files uploaded yet</p>
        ) : (
          <div className="space-y-2">
            {sources.map((source) => (
              <CardContent
                key={`${source._id}`}
                className="p-2 rounded-lg border hover:bg-muted/30 transition cursor-pointer"
              >
                <div className="flex items-start justify-between w-full">
                  <div
                    className="flex items-start space-x-2 flex-1 min-w-0"
                    onClick={() => onSourceSelect(source)}
                  >
                    {source.sourceType === "file" ? (
                      <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    ) : (
                      <Link2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{source.name}</p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteFile(source._id, source.sourceType)
                    }}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
                  >
                    {deleting.includes(source._id) ? (
                      <Spinner className="h-3 w-3 text-red-500" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </CardContent>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
