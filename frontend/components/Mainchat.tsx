"use client"
import { useSourcesContext } from '@/context/SourceContext'
import { FileText, Link2, MessageSquare, Upload } from 'lucide-react'
import React from 'react'
import { useUploadDialog } from '@/context/UploadDialogContext'
import { calculateFileSize } from '@/lib/calculateFilesize'

const Mainchat = () => {

  const { sources, toggleSource, selectedSources, loading } = useSourcesContext()
  const { openUploadDialog } = useUploadDialog()
  // console.log(sources);



 return (
  <div className='relative h-full'>
    <div className='flex flex-col gap-3 text-center w-full h-full p-0'>
      <div className='w-full'>
        <div className='flex flex-col items-center justify-center text-center mb-2 mt-2'>
          <MessageSquare size={48} className="text-muted-foreground" />
        </div>
        <div className='inline-flex items-center justify-center w-full h-12 rounded-2xl mb-1'>
          <h1 className='text-xl font-semibold'>Select Your Sources to Start Chat</h1>
        </div>
        
        <div className='grid grid-cols-2 gap-3'>
          {sources.slice(0, 7).map((source) => {
            const isSelected = selectedSources.some((s) => s._id === source._id)

            return (
              <div 
                role='button' 
                onClick={() => toggleSource(source)}
                key={`${source._id}`}
                className={`relative rounded-sm group cursor-pointer bg-card transition-all duration-300 p-4 h-[80px] flex items-center
                  border border-[#EEF4F9] dark:border-[#23272F]
                  hover:border-vblue-400/50 hover:bg-secondary/80
                  ${isSelected ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : ""}`}
              >
                
                <div className={`absolute top-2 right-2 border-2 w-3.5 h-3.5 shrink-0
                  ${isSelected ? "bg-blue-500 border-blue-500" : "border-slate-300 dark:border-slate-600"}`}>
                </div>

                <div className='flex flex-row items-center gap-3 w-full pr-4'>
                  <div className='shrink-0'>
                    {source.sourceType === "file" ? <FileText size={24}/> : <Link2 size={24}/>}
                  </div>
                  <h4 className='text-sm font-semibold line-clamp-2 text-left break-words'>
                    {source.name}
                  </h4>
                </div>
              </div>
            )
          })}

          <div role='button'
            onClick={openUploadDialog}
            className='flex flex-row items-center gap-3 h-[80px] border-2 border-slate-400 border-dotted group cursor-pointer transition-all duration-300 p-4 rounded-sm border border-[#EEF4F9] dark:border-[#23272F] hover:border-vblue-400/50'>
            <div className='shrink-0'>
              <Upload size={24} />
            </div>
            <h1 className="text-sm font-semibold text-left">Upload Sources</h1>
          </div>
        </div>
      </div>
    </div>
  </div>
)

}

export default Mainchat
