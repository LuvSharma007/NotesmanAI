"use client"

import React, { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import axios from 'axios'

export const UserProfile = () => {
    
    const [session,setSession]= useState<any>(null);
    const [isPending,setIsPending] = useState(true);
    

  useEffect(()=>{
    const getUser = async ()=>{
      try {
        const response = await axios.get(`http://localhost:4000/api/me`, {
          withCredentials: true,
        });        
        setSession(response.data);
      } catch (err) {
        setSession(null);
      } finally {
        setIsPending(false);
      }
    };
    getUser()
  },[])
  

  return (
    <div className='flex flex-col border-2 h-screen m-10 rounded-2xl'>
        <div className='flex justify-center items-center mt-5 '>
            <Avatar className="cursor-pointer h-25 w-25">   
                <AvatarImage src={session?.user.image ?? null} alt="User" className='object-cover' />
                <AvatarFallback>{}</AvatarFallback>
            </Avatar>
        </div>
        <div className='text-white flex flex-col justify-center items-center mt-5'>
            <label className='text-2xl'>Username:{session?.user?.username }</label>
            <label className='text-2xl'>Name:{session?.user?.name}</label>
            <label className='text-2xl'>Email:{session?.user?.email}</label>
        </div>
    </div>
  )
}
