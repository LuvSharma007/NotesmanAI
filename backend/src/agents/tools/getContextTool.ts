import { tool } from "langchain";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import z from "zod";
import { client } from "../../lib/qdrantClient.js";
import { OpenAIEmbeddings } from "@langchain/openai";

export const getContext = tool(  
  async ({ query }, config) => {
    // console.log("User's Query:",query);
    
    // console.log("Tool Called");
    
    const qdrantCollection = config.context.qdrantCollectionName;
    if (!qdrantCollection) {
      throw new Error("Qdrant collection is missing");
    }
    // console.log("Qdrant collection",qdrantCollection);
    
    // const embeddings = new GoogleGenerativeAIEmbeddings({
    //   apiKey: process.env.GEMINI_API_KEY,
    //   model: "gemini-embedding-001",
    // });

    const embeddings = new OpenAIEmbeddings({
            apiKey:process.env.OPENAI_API_KEY,
            model:"text-embedding-3-large"
    })
    
    // console.log("Embeddings Setup Done");
    
    const queryEmbedding = await embeddings.embedQuery(query);
    console.log("Embeddings Response:",queryEmbedding);
    // const queryEmbedding = embeddingResponse[0];
    // console.log("Embeddings Response:",queryEmbedding);

    const searchResult = await client.search(qdrantCollection, {
      vector: queryEmbedding,
      limit: 5,
    });

    if (!searchResult) {
      throw new Error("No search result");
    }
    // console.log("Search Result:",searchResult);
    
    const contexts = searchResult
  .map(r => r.payload?.content)
  .filter((content): content is string => typeof content === 'string' && content.trim() !== "")
  .join("\n\n");
    // console.log("context:",contexts);
    
    return contexts || "No relevant context found.";

  },
  {
    name: "get-context",
    description: "Returns the Available context for a user query.",
    schema: z.object({
      query: z.string(),
    }),
  }
);