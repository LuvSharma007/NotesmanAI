"use client"

import { Brain, ChevronDown } from 'lucide-react'
import { useChats } from '@/hooks/useChats'
import { useChatsContext } from '@/context/chatsContext'
import { useEffect, useState } from 'react'

interface ThinkingMessageProps {
  content: string
}

export function ThinkingMessage({ content }: ThinkingMessageProps) {


  const {isThinking } = useChatsContext();
  const [isOpen,setIsOpen] = useState(false);

  useEffect(() => {
    if (isThinking && content.length > 0) {
      setIsOpen(true);
    } else if (!isThinking) {
      setIsOpen(false);
    }
  }, [isThinking, content]);


  return (
    <div className='w-full flex justify-start items-start flex-col gap-3'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors'
      >
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
        <Brain size={16} />
        <span className='text-sm font-medium'>
            Thinking
        </span>
      </button>

      {isOpen && (
        <div className='w-full'>
          <div className='bg-muted/30 p-3 rounded-lg max-w-[80%] border border-border/50'>
            <p className='font-mono text-zinc-400 text-xs leading-relaxed whitespace-pre-wrap'>
              {content}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
