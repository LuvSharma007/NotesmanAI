import React from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { MoreVertical } from 'lucide-react'
import { useChatsContext } from '@/context/chatsContext'

const ChatsAction = ({chatId}:{chatId:string}) => {
    const {deleteChat,renameChat,shareChat} = useChatsContext()
    return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <span
                    role='button'
                    className='opacity-0 group-hover/chat:opacity-100 data-[state=open]:opacity-100 p-1 hover:bg-card rounded-sm transition-opacity outline-none'
                    onClick={(e) => e.stopPropagation()}
                    >
                        <MoreVertical size={15}/>
                    </span>
                </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                        onClick={renameChat}
                        >Share
                        </DropdownMenuItem>
                        <DropdownMenuItem
                        onClick={shareChat}
                        >
                            Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            variant={'destructive'}
                            onClick={(e)=>{
                                e.stopPropagation();
                                deleteChat({chatId})
                            }}
                        >Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
            </DropdownMenu>
    )
}

export default ChatsAction