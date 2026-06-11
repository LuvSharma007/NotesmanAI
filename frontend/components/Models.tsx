"use client"
import React, { SVGProps, useState } from 'react'
import { Input } from './ui/input'
import { Funnel, Search } from 'lucide-react'
import Modelslist from './Modelslist'
import Modelsidebar from './Modelsidebar'

interface ModelsProps {
  selectedModel: {
    company: string;
    modelName: string;
  };
  setSelectedModel: React.Dispatch<
    React.SetStateAction<{
      company: string;
      modelName: string;
    }>
  >;
}

const Models = ({selectedModel,setSelectedModel}:ModelsProps) => {

const [selectedCompany, setSelectedCompany] = useState(selectedModel.company);

  return (
    <div className="bg-card border-none w-full flex flex-col">
      <div className='border-2 flex items-center justify-center gap-x-2 p-2 rounded-lg'>
  <Search size={20} className="text-muted-foreground" />
  <Input 
    placeholder='search models'
    className='border-none bg-card w-full focus-visible:ring-0 focus-visible:ring-offset-0'
  />
  <Funnel />
</div>

<div className='flex flex-row gap-x-4 mt-2 p-1 items-start w-full'>
  <Modelsidebar
  selectedModel={selectedCompany}
  onModelSelect={setSelectedCompany}
/>
  <div className="flex-1">
    <Modelslist
  selectedCompany={selectedCompany}
  setSelectedModel={setSelectedModel}
/>
  </div>
</div>

    </div>
  )
}

export default Models
