"use client"
import { useChatsContext } from '@/context/chatsContext'
import { useSourcesContext } from '@/context/SourceContext'
import { ArrowRight, Globe, X } from 'lucide-react'
import { useParams } from 'next/navigation'
import React from 'react'

const InputField = () => {
    const { doChat, input, setInput } = useChatsContext();
    const { selectedSources, toggleSource, isGlobeActive, setIsGlobeActive } = useSourcesContext()

    // console.log("selected Sources",selectedSources);

    const { id } = useParams<{ id: string }>()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        doChat(id);
    }

    const handleWebSearch = () => {
        setIsGlobeActive(!isGlobeActive)
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
                            <div className='flex justify-between items-center'>
                                <div className='ml-2 flex items-center'>
                                    <button
                                        type='button'

                                        className={`mr-3 p-1 cursor-pointer transition-colors flex items-center justify-center rounded-xl ${isGlobeActive ? 'text-white rounded-xl bg-blue-600' : 'text-gray-600'
                                            }`}
                                        onClick={handleWebSearch}
                                    >
                                        <Globe size={20} />
                                    </button>
                                    
                                </div>

                                <button className='hover:opacity-80 mr-3 border-bg-gray-700 cursor-pointer rounded-xl'
                                    type="submit"
                                >
                                    <ArrowRight size={28}/>
                                </button>
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