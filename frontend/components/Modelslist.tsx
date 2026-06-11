"use client"
import React from 'react'

interface Features {
    reasoning:boolean,
    toolCall:boolean
    vision:boolean
    pdfComprehension:boolean
    mcpSupport:boolean
    coding:boolean
    agentic:boolean
}

interface ModelDetails {
    name:string;
    description:string;
    isPaid:boolean,
    requiredSubscription:boolean,
    features:Features;
}

interface ModelsList {
  company: string;
  models: ModelDetails[];
}


export const aiModels: ModelsList[] = [
    {
        company: "OpenAI",
        models: [
            {
                name: "GPT-nano",
                description: "Fastest GPT-5.4 tuned for speed and low cost",
                isPaid:true,
                requiredSubscription:true,
                features:{reasoning:true,agentic:true,coding:true,mcpSupport:true,pdfComprehension:true,toolCall:true,vision:true}
            },
            {
                name: "GPT-5.5",
                description: "OpenAI latest and greatest model",
                isPaid:true,
                requiredSubscription:true,
                features:{reasoning:true,agentic:true,coding:true,mcpSupport:true,pdfComprehension:true,toolCall:true,vision:true}
            }
        ]
    },
    {
        company: "Anthropic",
        models: [
            {
                name: "Claude Sonnet 4.6",
                description: "anthropic sonet for real-world work",
                isPaid:true,
                requiredSubscription:true,
                features:{reasoning:true,agentic:true,coding:true,mcpSupport:true,pdfComprehension:true,toolCall:true,vision:true}
            },
            {
                name: "Claude Opus 4.7",
                description: "anthropic frontier model",
                isPaid:true,
                requiredSubscription:true,
                features:{reasoning:true,agentic:true,coding:true,mcpSupport:true,pdfComprehension:true,toolCall:true,vision:true}
            }
        ]
    },
    {
        company: "Gemini",
        models: [
            {
                name: "Nano Banana Pro",
                description: "highely efficient image generation model",
                isPaid:true,
                requiredSubscription:true,
                features:{reasoning:true,agentic:true,coding:true,mcpSupport:true,pdfComprehension:true,toolCall:true,vision:true}
            },
            {
                name: "Gemini 3.1 pro",
                description: "Fast , low latency Gemini 3.1 for everyday workloads",
                isPaid:true,
                requiredSubscription:true,
                features:{reasoning:true,agentic:true,coding:true,mcpSupport:true,pdfComprehension:true,toolCall:true,vision:true}
            }
        ]
    },
    {
        company: "Meta",
        models: [
            {
                name: "Llama 4 Scout",
                description: "Efficient multimodel explorer",
                isPaid:true,
                requiredSubscription:true,
                features:{reasoning:true,agentic:true,coding:true,mcpSupport:true,pdfComprehension:true,toolCall:true,vision:true}
            },
            {
                name: "Llama 4 Maverick",
                description: "the capable conversatinoalist",
                isPaid:true,
                requiredSubscription:true,
                features:{reasoning:true,agentic:true,coding:true,mcpSupport:true,pdfComprehension:true,toolCall:true,vision:true}
            }
        ]
    },
    {
        company: "Moonshot",
        models: [
            {
                name: "Kimi K2.6",
                description: "Kimi K2.6 is Kimi’s latest and most intelligent model",
                isPaid:true,
                requiredSubscription:true,
                features:{reasoning:true,agentic:true,coding:true,mcpSupport:true,pdfComprehension:true,toolCall:true,vision:true}
            },
            {
                name: "Kimi K2.5",
                description: "Kimi K2.5 supports text, image, and video input, thinking and non-thinking modes, and dialogue and agent tasks.",
                isPaid:true,
                requiredSubscription:true,
                features:{reasoning:true,agentic:true,coding:true,mcpSupport:true,pdfComprehension:true,toolCall:true,vision:true}
            }
        ]
    },
    {
        company: "Qwen",
        models: [
            {
                name: "Qwen3.7-Plus",
                description: "a multimodal agent model that unifies vision and language into a single, versatile agent foundation.",
                isPaid:true,
                requiredSubscription:true,
                features:{reasoning:true,agentic:true,coding:true,mcpSupport:true,pdfComprehension:true,toolCall:true,vision:true}
            },
            {
                name: "Qwen3.7",
                description: "Qwen3.7-Max is built to be a versatile agent foundation - equally capable of writing and debugging code, automating office workflows",
                isPaid:true,
                requiredSubscription:true,
                features:{reasoning:true,agentic:true,coding:true,mcpSupport:true,pdfComprehension:true,toolCall:true,vision:true}
            }
        ]
    },
    {
        company: "Mistral",
        models: [
            {
                name: "Mistral Medium 3.5",
                description: "Our flagship model that merges instruction-following, reasoning, and coding into a single 128B dense model.",
                isPaid:true,
                requiredSubscription:true,
                features:{reasoning:true,agentic:true,coding:true,mcpSupport:true,pdfComprehension:true,toolCall:true,vision:true}
            },
            {
                name: "Mistral Large 3",
                description: "Open-weight, general-purpose, flagship multimodal and multilingual model.",
                isPaid:true,
                requiredSubscription:true,
                features:{reasoning:true,agentic:true,coding:true,mcpSupport:true,pdfComprehension:true,toolCall:true,vision:true}
            },
            {
                name: "OCR 3",
                description: "The world's best document extraction and understanding model.",
                isPaid:true,
                requiredSubscription:true,
                features:{reasoning:true,agentic:true,coding:true,mcpSupport:true,pdfComprehension:true,toolCall:true,vision:true}
            }
        ]
    },
    {
        company: "Perplexity",
        models: [
            {
                name: "Sonar",
                description: "A lightweight, cost-effective search model optimized for quick, grounded answers with real-time web search.",
                isPaid:true,
                requiredSubscription:true,
                features:{reasoning:true,agentic:true,coding:true,mcpSupport:true,pdfComprehension:true,toolCall:true,vision:true}
            },
        ]
    },
    {
        company: "Deepseek",
        models: [
            {
                name: "DeepSeek-R1",
                description: "a model trained via large-scale reinforcement learning (RL) without supervised fine-tuning (SFT) as a preliminary step, demonstrated remarkable performance on reasoning. With RL",
                isPaid:true,
                requiredSubscription:true,
                features:{reasoning:true,agentic:true,coding:true,mcpSupport:true,pdfComprehension:true,toolCall:true,vision:true}
            },
            {
                name: "DeepSeek-R1-Zero",
                description: "naturally emerged with numerous powerful and interesting reasoning behaviors.",
                isPaid:true,
                requiredSubscription:true,
                features:{reasoning:true,agentic:true,coding:true,mcpSupport:true,pdfComprehension:true,toolCall:true,vision:true}
            },
        ]
    },
]

interface ModelListsProps {
  selectedCompany: string;
  setSelectedModel: React.Dispatch<
    React.SetStateAction<{
      company: string;
      modelName: string;
    }>
  >;
}

const Modelslist = ({selectedCompany,setSelectedModel}:ModelListsProps) => {

    const filterModels = aiModels.filter(
  group => group.company === selectedCompany
);
    
    return (
        <div className="max-h-[300px] overflow-y-auto mt-2 space-y-4 pr-1 ">
            {filterModels.map((group, index) => (
                <div key={index} className="space-y-1">
                    
                    <div className="text-xs font-semibold tracking-wider text-muted-foreground uppercase px-2 py-1">
                        {group.company}
                    </div>
                    
                    <div className="space-y-0.5">
                        {group.models.map((model, mIndex) => (
                            <button
                                title={model.description}
                                key={mIndex}
                                type="button"
                                onClick={()=>setSelectedModel({
                                    company:group.company,
                                    modelName:model.name
                                })}
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
