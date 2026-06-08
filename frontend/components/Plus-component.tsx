import React from 'react'
import { Button } from './ui/button'

const PlusComponent = () => {
  return (
    <div className='flex flex-col gap-x-5'>
        <Button>Web Search</Button>
        <Button>Connectors</Button>
    </div>
  )
}

export default PlusComponent