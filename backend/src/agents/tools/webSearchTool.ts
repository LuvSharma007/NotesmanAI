import { tool } from "@openai/agents";
import z from "zod";
import { openai } from "../../lib/openAIClient.js";

export const webSearch = tool({
    name: "web_search",
    description: "Use this tool to returns the latest information from the web about the user query.",
    parameters: z.object({ query: z.string() }),
    async execute({ query }) {
        console.log("web search tool called");
        console.log("query:", query);

        if (!query) {
            throw new Error("no user query found");
        }

        // Refine user's query
        const response = await openai.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a professional Editor that refines the user query for web search. fixes all the typos in user query, rewrite the query for web search. do not exceeds the refine query more than 50 words. keep it concise."
                },
                { role: "user", content: "is there is any open source tool for datadog?" },
                { role: "assistant", content: "open source alternatives for datadog." },
                { role: "user", content: "which one should i use in 2026 ? coolify or dokploy." },
                { role: "assistant", content: "coolify vs dokploy in 2026?" },
                { role: "user", content: "what is the weather in noida today?" },
                { role: "assistant", content: "today's weather in noida?" },
                {
                    role: "user",
                    content: query
                }
            ],
            temperature: 0.2
        });
        console.log("Response:", response);

        const refreshUserQuery = response.choices[0].message.content;
        if (!refreshUserQuery) {
            throw new Error("Something went wrong while redefining User's query");
        }
        console.log("refined User Query created:", refreshUserQuery);

        // Firecrawl request payload configuration
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: refreshUserQuery,
                limit: 5,
                timeout: 60000,
                ignoreInvalidURLs: false,
                scrapeOptions: {
                    formats: ['markdown'],
                    onlyMainContent: true,
                    onlyCleanContent: false,
                    maxAge: 172800000,
                    waitFor: 0,
                    mobile: false,
                    skipTlsVerification: true,
                    timeout: 60000,
                    removeBase64Images: true,
                    blockAds: true,
                    proxy: 'auto',
                    storeInCache: true
                }
            })
        };

        try {

            const res = await fetch('http://firecrawl-api:3002/v1/search', options);

            if (!res.ok) {
                const errorBody = await res.json();
                console.log("Validation errors:", errorBody.details || errorBody.error);
                throw new Error(`HTTP ${res.status}: ${JSON.stringify(errorBody)}`);
            }

            const data = await res.json();
            console.log("data received:", data);

            return data;

        } catch (error) {
            console.log("Error web search:", error);
            throw new Error("Web search tool not working");
        }
    }
});