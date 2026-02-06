"use client"

import React, { useRef, useState, useEffect } from "react"
import { CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, FileText, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { Spinner } from "./ui/shadcn-io/spinner"
import { useRouter } from "next/navigation"


interface Source {
  _id: string
  name: string
  // type: "pdf" | "docx" | "txt"
  // uploadDate: string
  // size: string
}

interface FileResponse {
  _id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  status?: string;
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
  const router = useRouter()

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
        toast.error("Remove an existing file to upload a new one.")
        return
      }

      try {
        setLoading(true)
        const formData = new FormData()
        formData.append("file", file)
        console.log("Before request");


        // Example: Adjust this API endpoint to your backend route
        const res = await fetch(`http://localhost:4000/api/v1/users/upload`, {
          method: "POST",
          body: formData,
          credentials: "include"
        })
        console.log("After request", res);

        if (!res.ok) throw new Error("Upload failed")

        const data = await res.json();

        if (!data.success) throw new Error("Upload failed");

        const uploadedFile = data.file;

        const newSource: Source = {
          _id: uploadedFile.id,
          name: uploadedFile.name,
          // type: uploadedFile.name.split(".").pop()?.toLowerCase() as "pdf" | "docx" | "txt",
          // uploadDate: new Date().toISOString(),
          // size: `${(file.size / 1024).toFixed(1)} KB`,
        }

        setSources((prev) => [...prev, newSource])
        console.log("sources:", sources);

        toast.success("File uploaded successfully!")
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

  useEffect(() => {
    const getAllFiles = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/v1/users/get-files", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          router.push("/login")
        }

        const data = await res.json();

        if (data.success && Array.isArray(data.files)) {
          const mappedFiles: Source[] = (data.files as FileResponse[]).map((f) => ({
            _id: f._id,
            name: f.fileName,
            type: f.fileType.includes("pdf")
              ? "pdf"
              : f.fileType.includes("word")
                ? "docx"
                : "txt",
            uploadDate: f.createdAt,
            size: `${(f.fileSize / 1024).toFixed(1)} KB`,
            status: f.status || "processing",
          }));

          setSources(mappedFiles);
        }
      } catch (error) {
        console.error("Error fetching files:", error);
        toast.error("Failed to load your files");
      }
    };

    getAllFiles();
  }, []);

  const handleDeleteFile = async (fileId: string) => {
    try {
      setDeleting((prev) => [...prev, fileId]);
      const res = await fetch(`http://localhost:4000/api/v1/users/delete-file/${fileId}`, {
        method: 'DELETE',
        credentials: "include",
      })
      if (!res.ok) {
        throw new Error("Failed to delete")
      }
      setSources((prev) => prev.filter((s) => s._id !== fileId))
      if (onSourceDelete) {
        onSourceDelete(fileId)
      }

      toast.success("File deleted");
    } catch (error) {
      toast.error("Error deleting file")
      console.log("error uploading file:", error);
    } finally {
      setDeleting((prev) => prev.filter((id) => id !== fileId))
    }
  }

  const handleUrlSubmit = async () => {
    try {
      if (!url.trim()) {
        toast.error("URL is required")
        return;
      }
      const res = await fetch(`http://localhost:4000/api/v1/url/getUrl`, {
        method: 'POST',
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      if (!res.ok) {
        throw new Error("Error Scrape URL")
      }
      toast.success("Processing URL")
    } catch (error) {
      toast.error("Error Sending URl")
      console.log("error sendings URL:", error);
    }
  }


  return (
    <div className="w-[280px] border-r border-border flex-shrink-0 rounded-2xl">
      {/* Header */}
      <div className="p-6 border-b">
        <h1 className="text-xl font-semibold mb-4">Dashboard</h1>

        {/* Upload Area */}
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center justify-center py-4 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:bg-muted/20 transition">
            {loading ? (
              <Spinner className="h-6 w-6" />
            ) : (
              <Upload className="h-6 w-6 text-muted-foreground mb-1" />
            )}
            <p className="text-xs text-foreground text-center">
              {sources.length >= 3
                ? "Remove existing file to upload new one"
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
                key={source._id}
                className="p-2 rounded-lg border hover:bg-muted/30 transition cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div
                    className="flex items-start space-x-2 flex-1"
                    onClick={() => onSourceSelect(source)}
                  >
                    <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{source.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {/* <Badge variant="secondary" className="text-xs">
                          {source.type.toUpperCase()}
                        </Badge> */}
                        {/* <span className="text-xs text-muted-foreground">{source.size}</span> */}
                      </div>
                      {/* <p className="text-xs text-muted-foreground mt-1">
                        {new Date(source.uploadDate).toLocaleDateString()}
                      </p> */}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteFile(source._id)
                    }}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
                  >
                    {deleting.includes(source._id) ? (
                      <Spinner className="h-3 w-3" />
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
