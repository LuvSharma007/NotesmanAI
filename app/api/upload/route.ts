import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises"
import { QdrantVectorStore } from "@langchain/qdrant";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import File from "@/models/File.Model";
import { auth } from "@/lib/auth";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";



export async function POST(request: Request) {
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
        console.log("File", files);

        const existingFile = await File.findOne({ userId: session.user.id });
        if (existingFile) {
            console.log("You can only upload one file. Delete the existing file first.");
            return NextResponse.json(
                { success: false, message: "You can only upload one file. Delete the existing file first." },
                { status: 400 }
            );
        }

        if (!files || files.length === 0) {
            return NextResponse.json({
                error: "No files Uploaded"
            }, { status: 400 })
        }

        // saving file temporarily

        const processedFiles: string[] = [];

        try {
            for (const file of files) {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes)

                const tempDir = path.join(process.cwd(), "tempFiles");
                await fs.mkdir(tempDir, { recursive: true });

                const filePath = path.join(process.cwd(), "tempFiles", file.name);
                console.log(filePath);
                await fs.writeFile(filePath, buffer)

                // collection name per file

                const baseName = path.parse(file.name).name
                const extentionName = path.extname(file.name).slice(1)
                const CollectionName = `${baseName}_Collection`
                console.log("Collection Name:", CollectionName);
                console.log("Extention Name:", extentionName);

                let docs;

                const ext = extentionName.toLowerCase();

                if (ext === 'pdf') {
                    const loader = new PDFLoader(filePath);
                    docs = await loader.load();
                    console.log("PDF Loading done");
                } else if (ext === 'txt') {
                    const loader = new TextLoader(filePath);
                    docs = await loader.load();
                    console.log("Text Loading done");
                } else if (ext === 'docx') {
                    const loader = new DocxLoader(filePath);
                    docs = await loader.load();
                    console.log("DOCX Loading done");
                } else {
                    throw new Error("Unsupported file type: " + extentionName);
                }

                // split docs in chunks 
                const splitter = new RecursiveCharacterTextSplitter({
                    chunkSize: 3000,
                    chunkOverlap: 200
                })
                const splitDocs = await splitter.splitDocuments(docs);
                console.log("Document chunks created");

                const validDocs = splitDocs.map(doc => {
                    // Remove problematic characters and ensure clean text
                    const cleanedContent = doc.pageContent
                        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                        .replace(/[^\w\s.,!?;:()-]/g, '') // Remove unusual characters
                        .trim();

                    return {
                        ...doc,
                        pageContent: cleanedContent
                    };
                }).filter(doc => doc.pageContent.length > 10); // Minimum length check

                if (validDocs.length === 0) {
                    throw new Error("No valid text found in document.");
                }

                console.log("Total Chunks:", splitDocs.length);
                console.log("Valid Chunks:", validDocs.length);

                // setup embeddings
                const embeddings = new GoogleGenerativeAIEmbeddings({
                    apiKey:process.env.GOOGLE_API_KEY,
                    model:'gemini-embedding-001'
                })
                console.log("Embedding Setup Done");

                const vector = await embeddings.embedQuery("hello world");
                console.log("Vector length:", vector.length);


                // setup to store in Qdrant DB

                try {
                    await QdrantVectorStore.fromDocuments(validDocs, embeddings, {
                        apiKey: process.env.QDRANT_API_KEY,
                        url: process.env.QDRANT_URL,
                        collectionName:CollectionName
                    });
                    console.log("Qdrant uploaded successfully");
                } catch (error) {
                    console.error("Error uploading to Qdrant. Collection NOT saved:", error);
                    throw error;
                }

                const fileInfo = await File.create({
                    userId: session?.user?.id,
                    fileName: file.name,
                    fileType: path.extname(file.name).slice(1),
                    fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
                    uploadedAt: new Date(),
                    qdrantCollection: CollectionName
                })
                console.log("MongoDb File Stored Successfully:", fileInfo);


                processedFiles.push(CollectionName);

                return NextResponse.json({
                    success: true,
                    message: "Document Indexed And Uploaded Successfully",
                    collections: processedFiles
                }, { status: 200 })

            }
        } catch (error) {
            console.log("Error During upload", error);

            return NextResponse.json({
                success: false,
                message: "Error while Storing Documents in Database"
            }, { status: 400 })

        }

    } catch (error) {
        console.log("Error while Uploading", error);

        return NextResponse.json({
            success: false,
            message: "Error while Indexing Document"
        }, { status: 400 })
    }
}




