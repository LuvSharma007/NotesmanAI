import { MCPServerStreamableHttp } from "@openai/agents";
import { McpTool } from "../../controllers/chat.controler.js";
import path from "path";

export const excalidrawMCP = async (mcpSelected:McpTool[] | undefined) => {
    let excalidrawMcp: MCPServerStreamableHttp | null = null; 
    try {
     const skillPath = path.resolve(process.cwd(), "excalidraw-diagram-skill");
    console.log("Resolved Skill Path:", skillPath);  
     const excalidrawSkills= 
         {
             type: "shell",
             name: "shell",
             environment: {
                 type: "local",
                 skills: [
                     {
                         name: "excalidraw-diagrams",
                         description: "Generate beautiful, structured architecture diagrams, flowcharts, and mind maps in Excalidraw JSON format.",
                         path: skillPath,
                     },
                 ],
             },
         }
     
         excalidrawMcp = new MCPServerStreamableHttp({
             url: "https://excalidraw-mcp-igrx.vercel.app/mcp",
             name: "Excalidraw MCP Server",
            });
            
            await excalidrawMcp.connect();
            console.log("MCP connected");
            
        console.log(await excalidrawMcp.listTools());

        const mcpRegistry: Partial<Record<McpTool, MCPServerStreamableHttp>> = {
            excalidraw: excalidrawMcp
        };

        const mcpSelectedArray = (mcpSelected ?? [])
              .map(name => mcpRegistry[name])
              .filter((server): server is MCPServerStreamableHttp => server !== null && server !== undefined);
        
        console.log("MCP selected-Array:", mcpSelectedArray);
        return {mcpSelectedArray,excalidrawSkills}
    } catch (error) {
        console.log("Error calling excalidraw MCP server",error);
        throw new Error("Excalidraw MCP")         
    }
}