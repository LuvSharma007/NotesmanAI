"use client"
import { useChatsContext } from '@/context/chatsContext'
import { useSourcesContext } from '@/context/SourceContext'
import { ArrowRight, Globe, X, ChevronUp, Plus, Cable, Check, Info } from 'lucide-react'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Button } from './ui/button'
import { AudioLinesIcon } from "@animateicons/react/lucide";
import { Switch } from './ui/switch'
import { modelPicture } from './Modelsidebar'
import { ModelsDropdownContent } from './model-component'
import { DropdownMenuItemDesc } from '@lobehub/ui/es/base-ui/DropdownMenu/atoms'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

const InputField = () => {
    const { doChat, input, setInput } = useChatsContext();
    const { selectedSources, toggleSource } = useSourcesContext()
    const [webSearchEnabled, setWebSearchEnabled] = useState<boolean>(false);  
    const [effort, setEffort] = useState("Low");
    const [thinking, setThinking] = useState(false);  
    const [selectedModel, setSelectedModel] = useState(() => {
        const saved = localStorage.getItem("selectedModel");

        return saved
            ? JSON.parse(saved)
            : {
                company: "OpenAI",
                modelName: "GPT-5.5",
            };
    });

    useEffect(() => {
        localStorage.setItem(
            "selectedModel",
            JSON.stringify(selectedModel)
        );
    }, [selectedModel]);

    const selectedCompanyData = modelPicture.find(
        (m) => m.company === selectedModel.company
    );

    // console.log("selected Sources",selectedSources);

    const { id } = useParams<{ id: string }>()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        doChat(id,webSearchEnabled);
    }

    // localstorage model
    

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
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="flex items-center gap-x-1.5 p-1 rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 transition-colors focus-visible:outline-none">
                                                <Plus size={24} className="shrink-0" />
                                                {webSearchEnabled && (
                                                    <Globe size={18} className="text-neutral-500 dark:text-neutral-400 shrink-0" />
                                                )}
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className='p-2 w-[180px] max-w-[90vw]'>
                                            <DropdownMenuGroup>
                                                <DropdownMenuItem  className='flex items-center gap-x-2 cursor-pointer'
                                                onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                                                >
                                                    <div className='flex items-center gap-x-2'>
                                                    <Globe size={16}/>
                                                    <span>Web Search</span>
                                                    </div>
                                                    {webSearchEnabled && (
                                                        <Check size={16} className="text-neutral-900 dark:text-neutral-100 shrink-0" />
                                                    )}
                                                </DropdownMenuItem>
                                            </DropdownMenuGroup>
                                            <DropdownMenuGroup>
                                                <DropdownMenuSub>
                                                <DropdownMenuSubTrigger>
                                                    <Cable/>
                                                    Connectors
                                                </DropdownMenuSubTrigger>
                                                <DropdownMenuPortal>
                                                    <DropdownMenuSubContent>
                                                            <DropdownMenuItem
                                                                onSelect={(e) => e.preventDefault()}
                                                                className='flex items-center justify-between gap-x-4 cursor-pointer'
                                                            >
                                                                <label htmlFor='excalidraw' className='cursor-pointer'>Excalidraw</label>
                                                                <Switch id='excalidraw' />
                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem
                                                                onSelect={(e) => e.preventDefault()}
                                                                className='flex items-center justify-between gap-x-4 cursor-pointer'
                                                            >
                                                                <label htmlFor='tldraw' className='cursor-pointer'>Tldraw</label>
                                                                <Switch id='tldraw' />
                                                            </DropdownMenuItem>
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuPortal>
                                                </DropdownMenuSub>
                                            </DropdownMenuGroup>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    {/* <Button
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
                                    </Button> */}
                                </div>
                                <div className='flex justify-between gap-x-2'>
                                    <div className='flex gap-x-1 m-1 rounded-xl'>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost"
                                                className="cursor-pointer text-sm bg-card hover:bg-transparent text-black dark:text-white rounded-sm">
                                                    {selectedCompanyData?.icon}
                                                    <span>{selectedModel.modelName}</span>
                                                </Button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent className="p-3 w-[450px] max-w-[90vw]">
                                                <ModelsDropdownContent
                                                selectedModel={selectedModel}
                                                setSelectedModel={setSelectedModel}
                                                />
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="default"
                                                    className="cursor-pointer text-sm bg-card hover:bg-transparent text-black dark:text-white rounded-sm gap-x-1">
                                                    <span className='text-muted-foreground'>{effort}</span>
                                                    <ChevronUp size={20} className="shrink-0" />
                                                </Button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent className='w-[320px] max-w-[90vw] p-3 bg-card text-neutral-200 border-neutral-800 rounded-xl space-y-3'>
                                                <div className="text-xs text-neutral-400 leading-normal px-1">
                                                    Higher effort means more thorough responses, but takes longer and uses your limits faster.
                                                </div>
                                                <div className="space-y-0.5">
                                                    {[
                                                        { value: "Low", label: "Low", isDefault: true },
                                                        { value: "Medium", label: "Medium" },
                                                        { value: "High", label: "High" },
                                                        { value: "Max", label: "Max", hasInfo: true },
                                                    ].map((item) => (
                                                        <DropdownMenuItem
                                                            key={item.value}
                                                            onClick={() => setEffort(item.value)}
                                                            
                                                            className="flex items-center justify-between px-2 py-2 rounded-md cursor-pointer text-sm font-medium"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <span>{item.label}</span>
                                                                {item.isDefault && (
                                                                    <span className="text-[10px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded border border-neutral-700 font-normal">
                                                                        Default
                                                                    </span>
                                                                )}
                                                                {item.hasInfo && (
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <div className="cursor-help p-0.5 rounded hover:bg-neutral-800" onClick={(e) => e.stopPropagation()}>
                                                                                <Info size={14} />
                                                                            </div>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent
                                                                            side="top"
                                                                            className="bg-neutral-950 text-neutral-200 border-neutral-800 text-xs px-2 py-1 max-w-[200px]"
                                                                        >
                                                                            Max effort uses maximum tokens to generate deeply analyzed, high-fidelity responses.
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                )}
                                                            </div>

                                                            {effort === item.value && (
                                                                <Check size={16}/>
                                                            )}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </div>

                                                <DropdownMenuSeparator className="bg-neutral-800" />
                                                <div className="flex items-center justify-between px-1 pt-1">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-sm font-medium text-white">Thinking</span>
                                                        <span className="text-xs text-neutral-500">Can think for more complex tasks</span>
                                                    </div>
                                                    <Switch
                                                        checked={thinking}
                                                        onCheckedChange={setThinking}
                                                        className="data-[state=checked]"
                                                    />
                                                </div>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div>
                                        <div className='flex justify-between gap-x-2'>
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