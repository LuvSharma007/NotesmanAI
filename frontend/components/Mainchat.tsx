"use client"
import { useSourcesContext } from '@/context/SourceContext'
import { MessageSquare, Upload } from 'lucide-react'
import React from 'react'
import { useUploadDialog } from '@/context/UploadDialogContext'

const Mainchat = () => {

  const { sources, toggleSource, selectedSources } = useSourcesContext()
  const { openUploadDialog } = useUploadDialog()


  return (
    <div className='relative h-full'>
      <div className='flex flex-col gap-3 text-center w-full h-full p-0'>
        <div className='w-full'>
          <div className='flex flex-col items-center justify-center text-center mb-2 mt-2'>
            <MessageSquare size={48} className="text-muted-foreground" />
          </div>
          <div className='inline-flex items-center justify-center w-100 h-12 rounded-2xl mb-1'>
            <h1 className='text-xl font-semibold'>Select Your Sources to Start Chat</h1>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {
              sources.slice(0, 5).map((source) => {

                const isSelected = selectedSources.some((s) => s._id === source._id)

                return (
                  <div role='button' className={`rounded-sm group cursor-pointer bg-card transition-all duration-300 overflow-hidden p-4
        border border-[#EEF4F9] dark:border-[#23272F]
        hover:border-vblue-400/50 hover:bg-secondary/80
        ${isSelected ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : ""}`}
                    key={`${source._id}`}
                  >
                    <div className='flex flex-row gap-4'>
                      {/* 
                      <div className='relative w-[48px] 2xl:w-[64px] shrink-0'>
                      <img alt="PDF Icon" width="64" height="88"
                        src='https://github.com/shadcn.png'
                      />
                    </div> */}
                      <div role='button'
                        onClick={() => toggleSource(source)}
                        key={source._id}
                        className='flex flex-col flex-1 gap-2'>
                        <div className='flex flex-row justify-between items-center'>
                          <h4 className='text-md font-semibold line-clamp-1 text-left break-words break-all'> {`${source.name}`} </h4>
                          <button type='button' role='checkbox'
                            className={`border-2 w-3 h-3 shrink-0 ${isSelected ? "bg-blue-500 border-blue-500" : ""}`}>
                          </button>
                        </div>

                        <p className='text-xs text-muted-foreground line-clamp-2 text-left leading-5'>This document outlines the curriculum for the 6th semester of a Bachelor of Computer Application program at C.C.S. University, Meerut, covering topics in Computer Network Security, Information System Analysis, Design & Implementation, E-Commerce, Knowledge Management, and Major Project work.</p>
                      </div>
                    </div>
                  </div>
                )
              })
            }
            <div role='button'
              onClick={openUploadDialog}
              className='flex flex-col items-center justify-center border-3 border-slate-400 border-dotted group cursor-pointer transition-all duration-300 overflow-hidden p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vblue-500 focus-visible:ring-offset-2 border border-[#EEF4F9] dark:border-[#23272F] shadow-[0px_1px_3px_0px_#7F8EAE1F] hover:border-vblue-400/50'>
              <div className='flex flex-col items-center'>
                <div className='flex items-center justify-center w-[48px] h-[48px] 2xl:w-[64px] 2xl:h-[64px] shrink-0'>
                  <Upload size={25} />
                </div>
                <div className='flex items-center justify-center'>
                  <h1 className="text-md text-center">Upload Sources</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Mainchat
