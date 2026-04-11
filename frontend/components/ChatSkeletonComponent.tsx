import React from 'react'
import { Skeleton } from './ui/skeleton'

const ChatSkeletonComponent = () => {
  return (
    <div className='flex items-center space-x-2 px-2 py-2'>
        <Skeleton className="h-4 w-full rounded-md bg-muted/50" />
    </div>
  )
}

export default ChatSkeletonComponent