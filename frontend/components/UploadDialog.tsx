"use client"

import React, { useRef, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Upload } from 'lucide-react'

interface UploadDialogProps {
    open: boolean,
    onOpenChange: (open: boolean) => void
    onFileSelect?: (files: File[]) => void
    onUrlAdd?:(url:string)=> void
}

const UploadDialog = ({
    open,
    onOpenChange,
    onFileSelect,
    onUrlAdd
}: UploadDialogProps) => {

    const [dragActive, setDragActive] = useState(false)
    const [url, setUrl] = useState("");
    const inputRef = useRef<HTMLInputElement>(null)

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const files = Array.from(e.dataTransfer.files)
            onFileSelect?.(files)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const files = Array.from(e.target.files)
            onFileSelect?.(files)
        }
    }

    const handleAddUrl = () => {
        if (url.trim()) {
            onUrlAdd?.(url)
            setUrl('')
        }
    }
    
    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange} >
                <DialogContent className='sm:max-w-2xl cursor-pointer'>
                    <DialogHeader>
                        <DialogTitle>Upload Sources</DialogTitle>
                        <DialogDescription>This Dialog will upload user's sources</DialogDescription>
                    </DialogHeader>
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-12 ${dragActive
                            ? 'border-primary bg-primary/5'
                            : 'border-muted-foreground/25 bg-muted/50'
                            }`}
                    >
                        <div className="rounded-full bg-muted p-3">
                            <Upload className="h-6 w-6 text-muted-foreground" />
                        </div>

                        <div className="text-center">
                            <p className="font-medium text-foreground">Select Documents</p>
                            <p className="text-sm text-muted-foreground">
                                Drag & drop Documents & files here, or click to browse
                            </p>
                        </div>

                        <input
                            type="file"
                            ref={inputRef}
                            multiple
                            accept='.pdf'
                            onChange={handleChange}
                            className='hidden'
                        />

                        <button
                            onClick={() => inputRef.current?.click()}
                            className='mt-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium cursor-pointer'
                        >
                            Browse Files
                        </button>
                    </div>

                    <div className="mt-6 pt-6">
                        <p className="text-sm font-medium text-foreground mb-3">Or Add URL</p>
                        <div className="flex gap-2">
                            <input
                                type="url"
                                placeholder="Enter URL..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddUrl()}
                                className="flex-1 px-3 py-2 rounded-md border-2 bg-background text-foreground placeholder:text-muted-foreground text-sm outline-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors duration-200 hover:bg-stone-100 dark:hover:bg-stone-900"

                            />
                            <button
                                onClick={handleAddUrl}
                                className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-sm font-medium"
                            >
                                Add URL
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default UploadDialog



