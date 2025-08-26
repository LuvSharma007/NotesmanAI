import { NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/systemPrompt";
import { QdrantVectorStore } from "@langchain/qdrant";
import { auth } from "@/lib/auth";
import File from "@/models/File.Model";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { openai } from "@/lib/geminiClient";
import messageModel from "@/models/Message.Model";

export async function POST(request:Request){
    try {

        const session = await auth.api.getSession({ headers: request.headers });

        if (!session) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }
        const userId = session.user.id

        const fileInfo = await File.findOne({userId})
        const fileId = fileInfo?._id
        
        const {query} = await request.json();
        console.log("Query:",query);
        console.log("fileId:",fileId);
        
        

        if(!query || !fileId){
            return NextResponse.json({
                success:false,
                message:"Missing Query or filedId"
            },{status:400})
        }

        // Fetch file metadata from MongoDB

        const fileData = await File.findOne({_id:fileId,userId});
        if (!fileData) {
            return NextResponse.json(
                { success: false, message: "File not found or unauthorized" },
                { status: 404 }
            );
        }
        console.log("FileData:",fileData);
        

        const collectionName = fileData.qdrantCollection;
        console.log("Collections Name:",collectionName);
        

        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey:process.env.GOOGLE_API_KEY,
            model: "gemini-embedding-001",
        })

        console.log("Embeddings Done");
        
        
        // connect to existing Qdrant collection
        const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings,{
            url:process.env.QDRANT_URL,
            apiKey:process.env.QDRANT_API_KEY,
            collectionName,
        })
        console.log("Vector Store Done");
        
        
        const results = await vectorStore.similaritySearch(query,3);
        console.log("result from Vector Store",results);

        const systemPrompt = buildSystemPrompt({
            sourceType:  fileData.fileType,
            context: results.map(r => r.pageContent).join("\n")
        });

        await messageModel.create({
            userId,
            fileId,
            role:"user",
            content:query,
        })

        // create a ReadableStream to send data in Chunks
        let finalResponse = ""
        const stream = new ReadableStream({
            async start(controller) {
                const completion = await openai.chat.completions.create({
                    model: "gemini-2.0-flash",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: query },
                    ],
                    stream: true,
                });

                try {
                    for await (const chunk of completion) {
                        const text = chunk.choices[0].delta?.content;
                        if (text) {
                            finalResponse += text;
                            controller.enqueue(new TextEncoder().encode(text));
                        }
                    }
                    controller.close();

                    // saves the Message history in DB

                    await messageModel.create({
                        userId,
                        fileId,
                        role: "assistant",
                        content: finalResponse
                    })

                } catch (error) {
                    controller.error(error);
                }
            },
        });

        console.log("Response from LLM",stream);

        return new Response(stream, {
            headers: { "Content-Type": "text/plain; charset=utf-8" },
        });

    } catch (error) {
        console.error("Chat Error:", error);
        return NextResponse.json(
            { success: false, message: "Error handling chat", error: String(error) },
            { status: 500 }
        );
    }
}