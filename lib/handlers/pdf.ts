'use client'
import { QdrantVectorStore } from "@langchain/qdrant";
import {client} from "@/lib/qdrantDb"
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

export async function handlePdfQuery({
    query,
    collection,
    options
}:{
    query:string;
    collection:string;
    options?:{topK?:number}
}) {
    try {

        // load the existing collections from Qdrant

        const vectorStore = await QdrantVectorStore.fromExistingCollection(
            new GoogleGenerativeAIEmbeddings({model:"text-embedding-001"}),
            {
                client,
                collectionName:collection,
            }
        )

        // similarity search

        const results = await vectorStore.similaritySearch(
            query,
            options?.topK || 5
        )

        return {
            answer: "This is a mock answer. Later, integrate LLM to generate response.",
            chunks: results.map((r) => ({
                text: r.pageContent,
                metadata: r.metadata,
            })),
        };


    } catch (error) {
        console.error("PDF Handler Error:", error);
        throw new Error("Failed to query PDF collection");
    }
}