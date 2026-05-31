import { useEffect, useState } from "react"
import { toast } from "sonner";

export interface Source {
    _id: string
    name?: string,
    sourceType: "file" | "url"
    size?: number
    createdAt: string,
    url?: string,
    status?:string
}

export interface SourceResponse {
    _id: string
    name?: string,
    sourceType: "file" | "url"
    fileSize?:number
    createdAt: string,
    url?: string,
    status?:string
}

export const useSource = () => {
    const [sources, setSources] = useState<Source[]>([])
    // console.log("sources:",sources);
    
    const [loading, setLoading] = useState(false)
    const [selectedSources, setSelectedSources] = useState<Source[]>([])

    const loadSources = async ()=>{
        try {
            const skip = 0;
            const response = await fetch(`/api/v1/files/getSources?skip=${skip}`,{
                method:'GET',
                credentials:"include",
            })

            if(!response.ok){
                console.log("No Sources in Body");
                return
            }
            const data = await response.json()
            if(data.success && data.sources.length === 0){
                return;
            }
            const allSources: Source[] = data.sources.map((s:SourceResponse)=>({
                _id: s._id,
                name: s.name,
                sourceType:s.sourceType,
                size:s.fileSize,
                url:s.url,
                createdAt:s.createdAt
            }))
            setSources(allSources)           

        } catch (error) {
            console.log("Error fetching sources",error);
            toast.error("Error fetching sources")            
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

            const res = await fetch(`/api/v1/files/upload`, {
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

            const res = await fetch(`/api/v1/files/delete-file/${id}?sourceType=${type}`, {
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
    }

}