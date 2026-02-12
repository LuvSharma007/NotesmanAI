import { client } from "../../lib/qdrantClient.js";
import { tool} from "@openai/agents";
import { z } from "zod"
import { OpenAIEmbeddings } from "@langchain/openai";
import OpenAI from "openai"
const openai = new OpenAI()

export const getContext = tool({
  name: "get_context",
  description: "Returns the Available context for a user query.",
  parameters: z.object({ query: z.string() }),
  async execute({ query}, toolContext:any) {
    const {id,userId} = toolContext.context
    console.log("getContext Tool Called");
    console.log("User's Query:", query);
    console.log("id:", id)
    console.log("userId:",userId);
    if (!id) {
      throw new Error("file or url id is missing");
    }

    if (!userId) {
      throw new Error("Qdrant collection is missing");
    }
    
    const embeddingsSetup = new OpenAIEmbeddings({
      apiKey: process.env.OPENAI_API_KEY,
      model: "text-embedding-3-large",
      batchSize: 100,  // reduce load
      dimensions: 1000
    })
    console.log("Embeddings Setup Done");
    
    const embeddings = await embeddingsSetup.embedQuery(query)
    
    console.log("Vector Embeddings of user's query:", embeddings);
    const qdrantCollection = `user_${userId}`

    let searchResult: any[] = [];
    try {
      searchResult = await client.search(qdrantCollection, {
        vector: embeddings,
        filter: {
          must: [
            {
              key: "payloadValue",
              match: { value: id }
            }
          ]
        },
        limit: 5,
        with_payload: true
      });
      console.log("Search Result:", searchResult);
    } catch (error) {
      console.log("Error connecting to qdrant client", error);
    }

    const contexts = searchResult.map(r => r.payload?.text)
      .filter((text): text is string => typeof text === 'string' && text.trim() !== "")
      .join("\n\n");
    console.log("context:", contexts);

    return contexts || "No relevant context found.";

  }
})