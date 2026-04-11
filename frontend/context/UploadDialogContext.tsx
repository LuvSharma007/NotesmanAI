"use client"

import UploadDialog from "@/components/UploadDialog"
import React, { createContext, useContext, useState } from "react"
import { useSourcesContext } from "./SourceContext"


type UploadDialogContextType = {
    openUploadDialog: () => void
    closeUploadDialog: () => void
}

const UploadDialogContext = createContext<UploadDialogContextType | undefined>(undefined)

export function UploadDialogProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const { uploadFile, uploadUrl } = useSourcesContext()

    const handleFileSelect = (files: File[]) => {
        if (files.length > 0) {
            uploadFile(files[0])
            setOpen(false)
        }
    }

    return (
        <UploadDialogContext.Provider value={{
            openUploadDialog: () => setOpen(true),
            closeUploadDialog: () => setOpen(false)
        }} >
            <UploadDialog
                open={open}
                onOpenChange={setOpen}
                onFileSelect={handleFileSelect}
                onUrlAdd={(url) => uploadUrl(url)}
            />
            {children}
        </UploadDialogContext.Provider>
    )
}

export function useUploadDialog() {
    const context = useContext(UploadDialogContext)
    if (!context) {
        throw new Error("useUploadDialog must be used inside UploadDialogProvider")
    }
    return context
}