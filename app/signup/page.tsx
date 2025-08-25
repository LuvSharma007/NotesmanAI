import React from 'react'
import { SignUpForm } from '@/components/signup-form'
const page = () => {
  return (
      <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <a className="flex items-center gap-2 self-center font-medium">
          </a>
          <SignUpForm />
        </div>
      </div>
    )
}

export default page