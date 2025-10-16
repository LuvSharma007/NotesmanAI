import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { tool , RunContext } from "@openai/agents";
import z from "zod";
import { client } from "../../lib/qdrantClient.js";

interface LocalContext{
    userId:string,
    fileId:string,
    qdrantCollectionName:string
}

export const getContext = tool({
    name:"get-context",
    description:'Returns the Available context for a user query.',
    parameters:z.object({
        query:z.string(),
    }),
    async execute({query},runContext?: RunContext<LocalContext>){
        // console.log("Tool called");
        
        const qdrantCollection = runContext?.context.qdrantCollectionName;
        if(!qdrantCollection){
            throw new Error("Qdrant collection is missing")
        }
        // console.log("From tools");
        
        // console.log("Qdrant collection",qdrantCollection);
        
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey:process.env.GEMINI_API_KEY,
            model:"gemini-embedding-001",
        })
        // console.log("Embeddings setup done");
        
        const embeddingResponse = await embeddings.embedDocuments([query])
        // console.log("created embeddings of query");

        const queryEmbedding = embeddingResponse[0];
        // console.log("Query Embeddings",queryEmbedding.length);

        const searchResult = await client.search(qdrantCollection,{
            vector:queryEmbedding,
            limit:5,
        })
        if(!searchResult){
            throw new Error("No search result")
        }
        // console.log(searchResult,JSON.stringify(searchResult,null,2));
        // const contextText = searchResult.map((hit) => hit.payload?.text).join("\n\n");
        // return contextText || "No context found in the file.";
        return searchResult;
    }
    
})