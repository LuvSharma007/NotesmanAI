"use client"
import { useChatsContext } from '@/context/chatsContext'
import { useSourcesContext } from '@/context/SourceContext'
import { useParams } from 'next/navigation'
import React, { useEffect } from 'react'
import { ThinkingMessage } from './thinking-message'
import ExcalidrawWrapper from './excalidrawWrapper.tsx'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';


const ChatComponent = () => {

  const { selectedSources } = useSourcesContext();
  const { messages, isLoading , getMessagesAndSource } = useChatsContext();
  const {id} = useParams<{id:string}>()
  
    
  useEffect(()=>{
    if(messages.length === 0){     
      getMessagesAndSource(id)
    }
  },[id])

  return (
    <>
      <div className='flex flex-col h-full overflow-hidden'>
        {/* Sources header mapping... */}
        <div className='space-y-4 mb-4 flex-shrink-0'>
          <div className="w-full h-16 flex items-center justify-end space-x-3 overflow-x-auto">
            {selectedSources.map((source) => (
              <div className='border-2 w-36 rounded-md' key={source._id}>
                <div className='p-1.5 flex flex-col min-w-0 max-w-36 flex-1'>
                  <p className='text-xs font-medium line-clamp-2 leading-tight'>
                    {source.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div className='flex-1 overflow-y-auto space-y-4'>
          {messages.map((message) => (
            <React.Fragment key={message._id}>
              {message.role === "user" && (
                <div className='w-full flex justify-end items-start'>
                  <div className='bg-card text-card-foreground p-3 rounded-lg max-w-[80%] break-words shadow-sm'>
                    <p className='font-mono text-sm font-medium'>
                      {message.content}
                    </p>
                  </div>
                </div>
              )}
              
              {message.role === "assistant" && message.reasoning && (
                <ThinkingMessage reasoning={message.reasoning} />
              )}
              
              {message.role === "assistant" && message.diagramData && message.diagramData.length > 0 &&( 
                  <ExcalidrawWrapper diagramData={message.diagramData}/>
              )}

              {/* ASSISTANT MESSAGE CONTENT WITH SYNTAX HIGHLIGHTING */}
              {message.role === "assistant" && message.content && (
                <div className='w-full flex justify-start items-start'> 
                  <div className='text-foreground p-3 rounded-lg max-w-[80%] break-words shadow-sm prose dark:prose-invert prose-sm max-w-none'>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          const isInline = !match;

                          // Extract properties safely to avoid passing unneeded HTML props to SyntaxHighlighter
                          const codeString = String(children).replace(/\n$/, '');

                          if (!isInline) {
                            return (
                              /* 1. Use w-full and max-w-full with overflow-hidden to lock the container width */
                              <div className="w-full max-w-full rounded-md overflow-hidden bg-[#282c34] my-4 border border-zinc-800">

                                {/* Header bar */}
                                <div className="flex items-center justify-between px-4 py-2 bg-[#21252b] text-zinc-400 text-xs font-mono">
                                  <span>{match[1]}</span>
                                  <button
                                    onClick={() => navigator.clipboard.writeText(codeString)}
                                    className="hover:text-white transition-colors"
                                  >
                                    {/* <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg> */}
                                  </button>
                                </div>

                                {/* 2. Force the highlighter to obey container bounds and scroll horizontally */}
                                <SyntaxHighlighter
                                  style={coldarkDark as { [key: string]: React.CSSProperties }}
                                  language={match[1]}
                                  PreTag="div"
                                  customStyle={{
                                    margin: 0,
                                    padding: '1rem',
                                    backgroundColor: '#000',
                                    width: '100%',            
                                    overflowX: 'auto' ,
                                  }}
                                  codeTagProps={{
                                    style: {
                                      fontSize: '0.875rem',
                                      fontFamily: 'monospace',
                                      fontWeight: '400',
                                    }
                                  }}
                                  showLineNumbers
                                  wrapLongLines={false}
                                >
                                  {codeString}
                                </SyntaxHighlighter>
                              </div>
                            );
                          }

                          // Fallback for inline code blocks (e.g. `const x = 1`)
                          return (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
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