import { tool } from "langchain";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import z from "zod";
import { client } from "../../lib/qdrantClient.js";
import { OpenAIEmbeddings } from "@langchain/openai";

export const getContext = tool(
  async ({ query }, config) => {
    // console.log("User's Query:",query);
    
    console.log("getContext Tool Called");

    const id = config.context.id;
    if (!id) {
      throw new Error("file or url id is missing");
    }
    console.log("id",id);
    
    const qdrantCollection = config.context.qdrantCollectionName;
    if (!qdrantCollection) {
      throw new Error("Qdrant collection is missing");
    }
    console.log("Qdrant collection",qdrantCollection);
    
    // const embeddings = new GoogleGenerativeAIEmbeddings({
    //   apiKey: process.env.GEMINI_API_KEY,
    //   model: "gemini-embedding-001",
    // });

    const embeddings = new OpenAIEmbeddings({
        apiKey:process.env.OPENAI_API_KEY,
        model:"text-embedding-3-large",
        dimensions:1000
    })
    
    console.log("Embeddings Setup Done");
    
    const queryEmbedding = await embeddings.embedQuery(query);
    console.log("Vector Embeddings of user's query:",queryEmbedding);
    // const queryEmbedding = embeddingResponse[0];
    // console.log("Embeddings Response:",queryEmbedding);

    let searchResult:any[]=[];
    try {
      searchResult = await client.search(qdrantCollection, {
        vector: queryEmbedding,
        filter:{
          must:[
            {
              key:"payloadValue",
              match:{value:id}
            }
          ]
        },
        limit: 5,
        with_payload:true
      });
      console.log("Search Result:",searchResult);
    } catch (error) {
      console.log("Error connecting to qdrant client",error);
    }
    
    const contexts = searchResult.map(r => r.payload?.text)
  .filter((text): text is string => typeof text === 'string' && text.trim() !== "")
  .join("\n\n");
    console.log("context:",contexts);
    
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