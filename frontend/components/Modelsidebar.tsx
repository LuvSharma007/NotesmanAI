"use client"
import React, { useEffect, useRef, useState } from 'react'
import { Anthropic, DeepSeek, Gemini, Grok, Meta, Mistral, Moonshot, OpenAI, Perplexity, Qwen } from '@lobehub/icons'
import { Button } from './ui/button'
import { ChevronDown } from 'lucide-react'

interface ModelSidebar {
    company:string,
    icon:React.ReactNode
}

interface ModelsidebarProps {
    selectedModel:string,
    onModelSelect:(company:string)=>void;
}

export const modelPicture:ModelSidebar[] = [
    { company:"OpenAI", icon:<OpenAI size={28} /> },
    { company:"Anthropic", icon: <Anthropic/> },
    { company:"Gemini", icon: <Gemini.Color/> },
    { company:"Meta", icon:<Meta.Color/> },
    { company:"Grok", icon:<Grok/> },
    { company:"Deepseek", icon:<DeepSeek.Color/> },
    { company:"Qwen", icon:<Qwen.Color/> },
    { company:"Moonshot", icon:<Moonshot/> },
    { company:"Perplexity",icon:<Perplexity/>},
    { company:"Mistral",icon:<Mistral.Color/>}
]

const Modelsidebar = ({selectedModel,onModelSelect}:ModelsidebarProps) => {
  return (
    <div className='border-r pl-1 pr-6 flex flex-col gap-y-3 max-h-[300px] overflow-y-auto shrink-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
        <ChevronDown size={24} className="animate-bounce mx-auto text-muted-foreground shrink-0 mt-1"/>
        {modelPicture.map((model, index)=>{
            const isNotOpenAI = model.company !== "OpenAI";
            
            return (
                <Button 
                    key={index} 
                    onClick={()=>onModelSelect(model.company)}
                    type="button"
                    size={"lg"}
                    title={model.company}
                    variant={'outline'}
                    disabled={isNotOpenAI}
                    className={`p-1.5 rounded-lg hover:bg-accent transition-colors flex items-center justify-center shrink-0 bg-card ${
                        isNotOpenAI ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                    }`}
                >
                    {model.icon}
                </Button>            
            )
        })}
    </div>
  )
}

export default Modelsidebar
