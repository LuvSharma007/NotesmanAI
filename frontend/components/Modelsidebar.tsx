"use client"
import React from 'react'
// Note: Openai must be written lowercase for @lobehub/icons
import { Anthropic, DeepSeek, Gemini, Grok, Meta, Mistral, Moonshot, OpenAI, Perplexity, Qwen } from '@lobehub/icons'
import { Button } from './ui/button'

const Modelsidebar = () => {
    const modelPicture = [
        { company:"OpenAI", icon:<OpenAI size={28} /> }, // Dropped to 28px to look sleek next to list text
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

  return (
    <div className='flex flex-col gap-y-3 px-1 max-h-[300px] overflow-y-auto shrink-0'>
        {modelPicture.map((model, index)=>(
            <Button 
                key={index} 
                type="button"
                size={"lg"}
                title={model.company}
                variant={'outline'}
                className="p-1.5 rounded-lg hover:bg-accent cursor-pointer transition-colors flex items-center justify-center shrink-0 bg-card"
            >
                {model.icon}
            </Button>            
        ))}        
    </div>
  )
}

export default Modelsidebar
