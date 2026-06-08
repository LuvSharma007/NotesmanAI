import { client } from "../../lib/qdrantClient.js";
import { tool } from "@openai/agents";
import { z } from "zod"
import { OpenAIEmbeddings } from "@langchain/openai";
import { openai } from "../../lib/openAIClient.js";
import { redisClient } from "../../lib/redisClient.js";

interface Source {
  sourceId: string,
  sourceType: "file | url";
}

export const getContext = tool({
  name: "get_context",
  description: "Returns the Available context for a user query.",
  parameters: z.object({ query: z.string() }),
  async execute({ query }, toolContext: any) {
    const { sourceIds, userId } = toolContext.context
    console.log("getContext Tool Called");
    console.log("User's Query:", query);
    console.log("SourceIds:", sourceIds)
    console.log("userId:", userId);
    if (sourceIds.length === 0) {
      throw new Error("No source");
    }

    if (!userId) {
      throw new Error("Qdrant collection is missing");
    }

    // refine user's query

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "You are a Professional Editor. that fix all Typos in an User's query. make the query consise and clear"
        },
        {
          role: "user",
          content: query
        }
      ],
      temperature: 0.2
    })
    // console.log("Response:", response);


    const refreshUserQuery = response.choices[0].message.content
    if (!refreshUserQuery) {
      throw new Error("Something went wrong while redefining User's query")
    }
    console.log("refined User Query created:", refreshUserQuery);

    const embeddingsSetup = new OpenAIEmbeddings({
      apiKey: process.env.OPENAI_API_KEY,
      model: "text-embedding-3-large",
      batchSize: 100,  // reduce load
      dimensions: 1000
    })
    console.log("Embeddings Setup Done");

    const embeddings = await embeddingsSetup.embedQuery(refreshUserQuery)
    if (embeddings.length > 0) {
      console.log("Vector Embeddings of user's query");
    }
    // console.log("Embeddings:", embeddings);


    const qdrantCollection = `user_${userId}`
    const sourceIdLists = sourceIds.sources.map((s: Source) => s.sourceId)
    let searchResult: any[] = [];
    try {
      searchResult = await client.search(qdrantCollection, {
        vector: embeddings,
        filter: {
          must: [
            {
              key: "payloadValue",
              match: { any: sourceIdLists }
            }
          ]
        },
        limit: 10,
        with_payload: true
      });
      console.log("Search Result:", searchResult);
    } catch (error) {
      console.log("Error connecting to qdrant client", error);
    }

    const contexts = searchResult.map(r => r.payload?.text)
      .filter((text): text is string => typeof text === 'string' && text.trim() !== "")
      .join("\n\n");
    // console.log("context:", contexts);d

    return contexts || "No relevant context found.";

  }
})