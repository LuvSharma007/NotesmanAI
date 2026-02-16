import { UserProfile } from '@/components/user-profile'
import { cookies } from 'next/headers';
import React from 'react'

const page = async () => {
  return (
    <UserProfile />
  )
}

export default page