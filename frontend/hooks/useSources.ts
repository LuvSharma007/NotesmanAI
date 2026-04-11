import { useEffect, useState } from "react"
import { toast } from "sonner";


interface FileResponse {
    _id: String;
    name: string,
    fileType: string,
    fileSize: number;
    createdAt: string;
    status?: string,
    url: string
}

interface UrlResponse {
    _id: string,
    name: string,
    createdAt: string;
    status?: string
}

export interface Source {
    _id: string
    name?: string,
    sourceType: "file" | "url"
    size?: number
    createdAt: string,
    url?: string
}

export const useSource = () => {
    const [sources, setSources] = useState<Source[]>([])
    // console.log("sources:",sources);
    
    const [loading, setLoading] = useState(false)
    const [selectedSources, setSelectedSources] = useState<Source[]>([])
    const [isGlobeActive , setIsGlobeActive] = useState(false)
    

    // load all files and Urls

    const loadSources = async () => {
        try {
            const [allFiles, allUrls] = await Promise.all([
                fetch(`/api/v1/users/get-files`, { credentials: "include" }),
                fetch(`/api/v1/url/getAllUrls`, { credentials: "include" })
            ])
            if (!allFiles.ok) {
                const errorData = await allFiles.json();
                toast.error(errorData.message || "Something went wrong")
                return;
            }

            if (!allUrls.ok) {
                const errorData = await allUrls.json();
                toast.error(errorData.message || "Something went wrong")
                return;
            }

            const filesData = await allFiles.json()
            const urlsData = await allUrls.json()
            if (filesData.success && filesData.files.length === 0
                && urlsData.success && urlsData.urls.length === 0) {
                return;
            }

            const files: Source[] = filesData.files.map((f: FileResponse) => ({
                _id: f._id,
                name: f.name,
                sourceType: "file",
                size: f.fileSize,
                url: f.url,
                createdAt: f.createdAt
            }))

            const urls: Source[] = urlsData.urls.map((u: UrlResponse) => ({
                _id: u._id,
                name: u.name,
                sourceType: "url",
                createdAt: u.createdAt
            }))
            setSources([...files, ...urls])
        } catch (error) {
            toast.error("Failed to load sources")
        }
    }

    useEffect(() => {
        loadSources()
    }, [])

    // upload file

    const uploadFile = async (file: File) => {
        try {
            setLoading(true)
            const formData = new FormData()
            formData.append("file", file)

            const res = await fetch(`/api/v1/users/upload`, {
                method: "POST",
                body: formData,
                credentials: "include"
            })
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "An error occured , please try again")
                return;
            }

            const newSource: Source = {
                _id: data.file.id,
                name: data.file.name,
                sourceType: "file",
                size: data.file.size,
                url: data.file.url,
                createdAt: data.file.createdAt
            }

            setSources((prev) => [ newSource ,...prev])
            toast.success("File uploaded Successfully")

        } catch (error) {
            console.log("Failed to upload file", error);
            toast.error("Failed to upload file")
            setLoading(false)
        } finally {
            setLoading(false)
        }
    }

    // upload URL

    const uploadUrl = async (url: string) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/v1/url/uploadUrl`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ url })
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.message || "Something went wrong")
                return;
            }

            if (!data) throw new Error("Url processing Failed")

            const urlSource: Source = {
                _id: data.url.id,
                name: data.url.name,
                sourceType: "url",
                createdAt: data.url.createdAt
            }

            setSources(prev => [urlSource,...prev])
            toast.success(data.message || "URL Processing")
        } catch (error) {
            toast.error("URL upload failed")
            setLoading(false)
        } finally {
            setLoading(false)
        }
    }

    // delete source

    const deleteSource = async (id: string, type: "file" | "url") => {
        try {

            const res = await fetch(`/api/v1/users/delete-file/${id}?sourceType=${type}`, {
                method: "DELETE",
                credentials: "include"
            })
            if (!res.ok) {
                toast.error("Failed to delete");
                return;
            }
            setSources((prev) => prev.filter((s) => s._id !== id))
            toast.success("File Deleted");
        } catch (error) {
            toast.error("Error deleting file")
        }
    }

    // for manual select from main chat
    const toggleSource = (source: Source) => {
        setSelectedSources((prev) => {            
            const exists = prev.find((s) => s._id === source._id)
            if (exists) {
                return prev.filter((s) => s._id !== source._id)
            }
            return [...prev,source]
        })
    }

    // if user select from documents for dynamic select from URL
    const selectSource = (source:Source)=>{
        setSelectedSources((prev)=>{
            const exists = prev.find((s)=>s._id === source._id)
            if(exists) return prev
            return [...prev,source];
        })
    }

    return {
        sources,
        loading,
        uploadFile,
        uploadUrl,
        deleteSource,
        reloadSources: loadSources,
        toggleSource,
        selectedSources,
        selectSource,
        setSelectedSources,
        isGlobeActive,
        setIsGlobeActive
    }

}