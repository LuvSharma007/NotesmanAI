"use client"
import { useChatsContext } from '@/context/chatsContext'
import { useSourcesContext } from '@/context/SourceContext'
import { ArrowRight, Globe, X, GlobeLock, ChevronUp, Plus } from 'lucide-react'
import { useParams } from 'next/navigation'
import React, { useState } from 'react'
import Models from './Models'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Button } from './ui/button'
import { OpenAI } from '@lobehub/icons'
import { AudioLinesIcon } from "@animateicons/react/lucide";
import PlusComponent from './Plus-component'

const InputField = () => {
    const { doChat, input, setInput } = useChatsContext();
    const { selectedSources, toggleSource } = useSourcesContext()
    const [webSearchEnabled, setWebSearchEnabled] = useState<boolean>(false);    

    // console.log("selected Sources",selectedSources);

    const { id } = useParams<{ id: string }>()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        doChat(id,webSearchEnabled);
    }

    return (
        <>
            <div className='flex justify-center w-full lg:px-8'>
                <div className='max-w-3xl w-full'>
                    <form onSubmit={handleSubmit} className='overflow-hidden border shadow-sm w-full bg-sidebar border-[#EEF4F9] dark:border-[#23272F]'>
                        <div className='flex flex-wrap gap-2 px-3 pt-2 pb-1 border-t overflow-hidden'>
                            {selectedSources.map((source) => (
                                <div className='group relative bg-card border overflow-hidden transition-all duration-200 min-w-44 hover:border-vblue-400/50 hover:shadow-md border-border shadow-sm flex flex-row'
                                    key={`${source._id}`}
                                >
                                    <div className='p-1.5 flex flex-col min-w-0 max-w-36 flex-1'>
                                        <h4 className='text-xs font-medium line-clamp-2 leading-tight' title=''>
                                            {source.name}
                                        </h4>
                                    </div>
                                    <X size={13} className='cursor-pointer'
                                        onClick={() => toggleSource(source)}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className='relative flex flex-col'>
                            <textarea
                                id='question-input'
                                name='question'
                                disabled={selectedSources.length <= 0}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className={`${selectedSources.length > 0 ? "font-mono w-full min-h-[80px] max-h-[200px] resize-none p-3 pb-12 overflow-hidden outline-none" : "font-mono w-full min-h-[80px] max-h-[200px] resize-none p-3 pb-12 overflow-hidden outline-none cursor-not-allowed"} `}
                                placeholder='Ask Questions...'
                            />
                            <div className='flex justify-between w-full'>
                                <div className='ml-2 flex items-center gap-x-5'>
                                    {/* <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Plus size={24}  className='cursor-pointer hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50'/>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className='p-3 w-[450px] max-w-[90vw]'>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                <PlusComponent/>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu> */}
                                    <Button
                                        type='button'
                                        variant="outline"

                                        className={`mr-2 p-1 cursor-pointer bg-card transition-colors flex items-center justify-center rounded-xl hover:bg-transparent ${webSearchEnabled ? 'text-black dark:text-white border-primary' : 'text-muted-foreground'
                                            }`}
                                        onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                                    >
                                        {webSearchEnabled ?
                                            <Globe size={20} />
                                            :
                                            <GlobeLock size={20} />
                                        }
                                        <span className='ml-1.5 text-sm'>web search</span>
                                    </Button>
                                </div>
                                <div className='flex gap-x-3'>
                                    <div className='flex gap-x-1 m-1 rounded-xl'>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="default" 
                                                className="cursor-pointer text-sm bg-card hover:bg-transparent text-black dark:text-white rounded-sm">
                                                    <OpenAI />
                                                    <span>GPT-5</span>
                                                    <span className='text-muted-foreground'>Low</span>
                                                    <ChevronUp size={20} className="shrink-0" />
                                                </Button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent className="p-3 w-[450px] max-w-[90vw]">
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                    <Models />
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <AudioLinesIcon
                                        size={20}
                                        duration={0.8}
                                        color="#fff"
                                        className='w-10 h-10 cursor-pointer hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50'
                                    />

                                <button className='w-10 h-10 cursor-pointer hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50'
                                    type="submit"
                                >
                                    <ArrowRight size={26} />
                                </button>
                                </div>
                            </div>
                        </div>
                    </form>
                    <div className='flex flex-col justify-center items-center pt-1.5 pb-1 sm:pt-2'>
                        <p className='text-[10px] sm:text-xs text-muted-foreground text-center px-2 select-none'>
                            Notesman can make mistakes , please verify the response
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default InputField