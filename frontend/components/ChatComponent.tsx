"use client"
import { useChatsContext } from '@/context/chatsContext'
import { useSourcesContext } from '@/context/SourceContext'
import { useParams } from 'next/navigation'
import React, { useEffect } from 'react'

const ChatComponent = () => {

  const { selectedSources } = useSourcesContext();
  const { messages, isLoading , getMessagesAndSource } = useChatsContext();
  const {id} = useParams<{id:string}>()
  // console.log("Id",id);
  // console.log("messages:",messages);
  
    
  useEffect(()=>{
    if(messages.length === 0){     
      getMessagesAndSource(id)
    }
  },[id])
  return (
    <>
      <div className='flex flex-col h-full overflow-hidden'>
        <div className='space-y-4 mb-4 flex-shrink-0'>
          <div className="w-full h-16 flex items-center justify-end space-x-3 overflow-x-auto">
            {selectedSources.map((source) => (
              <div className='border-2 w-36 rounded-md'
                key={source._id}
              >
                <div className='p-1.5 flex flex-col min-w-0 max-w-36 flex-1'>
                  <p className='text-xs font-medium line-clamp-2 leading-tight' title=''>
                    {source.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='flex-1 overflow-y-auto space-y-4'>
          {messages.map((message) => (
            <React.Fragment key={message._id}>
              {message.role === "user" && (
                <div className='w-full flex justify-end items-start'>
                  <div className='bg-card text-primary-foreground p-3 rounded-lg max-w-[80%] break-words shadow-sm'>
                    <p className='font-mono text-sm font-medium'>
                      {message.content}
                    </p>
                  </div>
                </div>
              )}
              {message.role === "assistant" && (
                <div className='w-full flex justify-start items-start'
                > 
                  <div className='text-foreground p-3 rounded-lg max-w-[80%] break-words shadow-sm'>
                    <p className='font-mono text-sm font-medium'>
                      {message.content || (isLoading && "AI is thinking...")}
                    </p>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  )
}

export default ChatComponent