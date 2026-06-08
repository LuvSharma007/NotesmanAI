"use client"
import React, { SVGProps } from 'react'
import { Input } from './ui/input'
import { Funnel, Search } from 'lucide-react'
import Modelslist from './Modelslist'
import Modelsidebar from './Modelsidebar'

const Models = ({ className, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <div className="hover:bg-transparent w-[500px] max-w-[90vw] flex flex-col">
      <div className='flex items-center justify-center gap-x-1 m-1 pb-2'>
        <Search size={20} className="text-muted-foreground" />
        <Input placeholder='search models'
          className='border-none bg-card'
        />
        <Funnel />
      </div>
      <div className='flex flex-row gap-x-4 mt-2 p-1 items-start'>
        <Modelsidebar/>

        <div className="flex-1">
          <Modelslist />
        </div>
      </div>
    </div>
  )
}

export default Models
