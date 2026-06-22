import { MCPServerStreamableHttp } from "@openai/agents";
import { McpTool } from "../../controllers/chat.controler.js";

export const tldrawMCP = async (mcpSelected:McpTool[] | undefined) => {
    let tldrawMcp: MCPServerStreamableHttp | null = null; 
    try {   
         tldrawMcp = new MCPServerStreamableHttp({
             url: "https://tldraw-mcp-app.tldraw.workers.dev/mcp",
             name: "tldraw MCP Server",
            });
            
            await tldrawMcp.connect();
            console.log("MCP connected");
            
        console.log(await tldrawMcp.listTools());

        const mcpRegistry: Partial<Record<McpTool, MCPServerStreamableHttp>> = {
            tldraw: tldrawMcp
        };

        const mcpSelectedArray = (mcpSelected ?? [])
              .map(name => mcpRegistry[name])
              .filter((server): server is MCPServerStreamableHttp => server !== null && server !== undefined);
        
        console.log("MCP selected-Array:", mcpSelectedArray);
        return {mcpSelectedArray}
    } catch (error) {
        console.log("Error calling tldraw MCP server",error);
        throw new Error("tldraw MCP")         
    }
}