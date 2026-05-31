"use client"
import React from 'react'

const Modelslist = () => {
    const aiModels = [
        {
            company: "OpenAI",
            image: "",
            models:[
                { name:"GPT-nano", description:"Fastest GPT-5.4 tuned for speed and low cost" },
                { name:"GPT-5.5", description:"OpenAI latest and greatest model" }
            ]
        },
        {
            company: "Anthropic",
            image: "",
            models:[
                { name:"Claude Sonnet 4.6", description:"anthropic sonet for real-world work" },
                { name:"Claude Opus 4.7", description:"anthropic frontier model" }
            ]
        },
        {
            company: "Gemini",
            image: "",
            models:[
                { name:"Nano Banana Pro", description:"highely efficient image generation model" },
                { name:"Gemini 3.1 pro", description:"Fast , low latency Gemini 3.1 for everyday workloads" }
            ]
        },
        {
            company: "Meta",
            image: "",
            models:[
                { name:"Llama 4 Scout", description:"Efficient multimodel explorer" },
                { name:"Llama 4 Maverick", description:"the capable conversatinoalist" }
            ]
        },
    ]

    return (
        <div className="max-h-[300px] overflow-y-auto mt-2 space-y-4 pr-1 ">
            {aiModels.map((group, index) => (
                <div key={index} className="space-y-1">
                    
                    <div className="text-xs font-semibold tracking-wider text-muted-foreground uppercase px-2 py-1">
                        {group.company}
                    </div>
                    
                    <div className="space-y-0.5">
                        {group.models.map((model, mIndex) => (
                            <button
                                key={mIndex}
                                type="button"
                                className="w-full text-left p-2 rounded-lg hover:bg-accent transition-colors flex flex-col cursor-pointer"
                            >
                                <span className="text-sm font-medium text-foreground">{model.name}</span>
                                <span className="text-xs text-muted-foreground line-clamp-1">{model.description}</span>
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default Modelslist
