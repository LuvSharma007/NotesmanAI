import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises"
import { QdrantVectorStore } from "@langchain/qdrant";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import File from "@/models/File.Model";
import { authClient, useSession } from "@/lib/auth-client";
import { auth } from "@/lib/auth";

export async function POST(request:Request){
    try {

    const session = await auth.api.getSession({ headers: request.headers });
        console.log(session);

        if (!session) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const files = formData.getAll("files") as File[];  // multiple files
        console.log("File",files);
        
        if(!files || files.length === 0){
            return NextResponse.json({
                error:"No files Uploaded"
            },{status:400})
        }
        
        // saving file temporarily

        const processedFiles:string[] = [];

        for(const file of files){
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes)

            const tempDir = path.join(process.cwd(),"tempFiles");
            await fs.mkdir(tempDir,{recursive:true});

            const filePath = path.join(process.cwd(),"tempFiles",file.name);
            console.log(filePath);
            await fs.writeFile(filePath,buffer)

            // collection name per file

            const baseName = path.parse(file.name).name
            const CollectionName = `${baseName}_Collection`
            console.log("Collection Name:",CollectionName);
            
            // load PDF
            const loader = new PDFLoader(filePath);
            const docs = await loader.load()
            console.log("PDF Loading done");

            // split docs in chunks 
            const splitter = new RecursiveCharacterTextSplitter({
                chunkSize:1000,
                chunkOverlap:200
            })         
            const splitDocs = await splitter.splitDocuments(docs);
            console.log("Document chunks created");   
    
            // setup embeddings
            const embeddings = new GoogleGenerativeAIEmbeddings({
              model: "embedding-001",
              apiKey:process.env.GOOGLE_API_KEY,          
            });
            console.log("Embedding Setup Done");
            
            
            // setup to store in Qdrant DB
            console.log("Qdrant Setup Done");
            await QdrantVectorStore.fromDocuments(splitDocs,embeddings,{
                apiKey:process.env.QDRANT_API_KEY,
                url:process.env.QDRANT_URL,
                collectionName:CollectionName
            })

            const fileInfo = await File.create({
                userId: session?.user?.id,
                fileName: file.name,
                fileType: path.extname(file.name).slice(1),
                fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
                uploadedAt: new Date(),
                qdrantCollection: CollectionName
            })
            console.log("MongoDb File Stored Successfully:",fileInfo);
            
            console.log("Qdrant uploaded successfully");
            
            processedFiles.push(CollectionName);
        }
        
        return NextResponse.json({
            success:true,
            message:"Document Indexed And Uploaded Successfully",
            collections:processedFiles
        },{status:200})
        
    } catch (error) {
        console.log("Error while Uploading",error);
        
        return NextResponse.json({
            success:false,
            message:"Error while Indexing Document"
        },{status:400})
    }
}




