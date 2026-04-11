import React from 'react'
import { Dialog, DialogContent, DialogTitle } from './ui/dialog'

const Pdfdialog = () => {
  return (
    <>
        <div className='border-2 flex flex-col h-full'>
            <Dialog>
                <DialogContent>
                    <DialogTitle>
                        <span>Pdf Document Here</span>
                    </DialogTitle>
                </DialogContent>
            </Dialog>

        </div>
    </>
  )
}

export default Pdfdialog