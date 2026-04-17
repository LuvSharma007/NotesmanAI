"use client"

import { Button } from '@/components/ui/button'
import { Card, CardAction, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { DeleteIcon, Download, Edit, EllipsisVertical, FileText, Folder, Info, LayoutGrid, Link2, Logs, MessageSquare, Upload } from 'lucide-react'
import React from 'react'
import { Spinner } from './ui/shadcn-io/spinner'
import { calculateFileSize } from '@/lib/calculateFilesize'
import { useRouter } from 'next/navigation'
import { useSourcesContext } from '@/context/SourceContext'
import { useUploadDialog } from '@/context/UploadDialogContext'

export interface Source {
  _id: string
  name: string,
  sourceType: "file" | "url"
  size?: number
  createdAt:string,
  url?:string,
}

export const SourceComponent = () => {

  const {sources,deleteSource,loading} = useSourcesContext()
  const {openUploadDialog} = useUploadDialog()

  const router = useRouter()

  return (
    <div className="flex flex-col h-full p-5">
      <h1 className='text-lg font-semibod'>All Sources</h1>
      <div className='w-full min-h-screen flex flex-col'>
        <div className='flex justify-between mt-2 ml-2 p-8'>
          <div className='flex gap-3'>
            <Button
              variant={'ghost'}
              onClick={openUploadDialog}
              disabled={loading}
              className='border-2 bg-border-gray-200 cursor-pointer w-28 flex justify-center items-center gap-2'>
              {loading ? (
                <Spinner className='h-4 w-4' />
              ) : (
                <>
                  <Upload />
                  Upload
                </>
              )}
            </Button>
            <Button variant={'ghost'} className='border-2 bg-border-gray-200 cursor-pointer'
            >
              <Folder />
              New Folder
            </Button>
          </div>
          <div className='flex gap-3 w-100'>
            <Input
              id='search'
              placeholder='Search sources...'
              className='border-none border-gray-900'
            />
            <ToggleGroup type='single'>
              <ToggleGroupItem value='a'>
                <Logs />
              </ToggleGroupItem>
              <ToggleGroupItem value='a'>
                <LayoutGrid />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>


        {sources.length === 0 ? (
          <div className='flex flex-col items-center justify-start gap-3 px-8 w-full h-full'>
            <p className='text-lg mt-10'>No Files and URLs Upload</p>
          </div>
        ) : (
          <div className='flex flex-col items-center justify-start px-8 w-full max-h-[500px] overflow-y-auto scrollbar-thin'>
            {sources.map((source) => (
              <Card
                key={`${source._id}`}
                className='flex flex-row items-center justify-between p-4 w-3/5 h-fit p-4 border-0 bg-transparent shadow-none hover:bg-secondary/80 transition-colors text-sm font-medium border-t border-border/60 rounded-lg cursor-pointer'>
                <div className='flex items-center gap-4'>
                  {source.sourceType === "file" ? (
                    <FileText className="h-6 w-6" />
                  ) : (
                    <Link2 className="h-5 w-6" />
                  )}
                  <div>
                    <CardTitle className='text-base'>{`${source.name}`}</CardTitle>
                  </div>
                </div>
                <div className="flex flex-col">
                  {source.sourceType === "file" && (
                    <div className='flex items-center gap-2'>
                      <p className='text-sm text-foreground'>
                        <span className='font-normal'>size: </span>
                        {calculateFileSize(source.size || 0)}
                      </p>
                    </div>
                  )}
                  {/* <div className='flex items-center gap-2'>
                    <Dot size={15} />
                    <p className='text-sm'>
                      Uploaded {formatDistanceToNow(new Date(source.createdAt),{addSuffix:true})}
                    </p>
                  </div> */}
                </div>

                <CardAction>
                  <div className='flex gap-2' >
                    <Button variant={'ghost'}
                      onClick={()=> router.push(`/chat?source=${source._id}`)}
                      className='border-2 bg-border-gray-200 cursor-pointer' >
                      <MessageSquare />
                      Chat
                    </Button>
                    <Button variant={'ghost'} className='border-2 bg-border-gray-200 cursor-pointer'>
                      <Info />
                      Details
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <EllipsisVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteSource(source._id, source.sourceType)
                          }}
                        >
                          <DeleteIcon />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                </CardAction>
              </Card>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}