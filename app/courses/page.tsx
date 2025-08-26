import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const courseSelect = () => {
  return (
    <section className="bg-zinc-50 py-16 md:py-15 dark:bg-transparent">
      <div className="@container mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-balance text-4xl font-semibold lg:text-5xl">Choose Your Course</h2>
          <p className="mt-4">Select from our premium courses designed to accelerate your learning journey with AI</p>
        </div>
        <div className="mx-auto mt-8 grid max-w-4xl gap-8 md:mt-16 md:grid-cols-2">
          <Card className="group shadow-zinc-950/5 flex flex-col h-full">
            <CardHeader className="pb-3">
              <div className="relative mx-auto h-48 w-full overflow-hidden rounded-lg">
                <Image src="https://hiteshchoudhary.com/images/nodejs-udemy.jpg"
                priority={false}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                alt="Web Development Course"
                fill
                className="object-cover" />
              </div>
              <h3 className="mt-6 text-xl font-medium transition">Nodejs Basic to Advance</h3>
            </CardHeader>
            <CardContent className="text-center flex-1 flex flex-col justify-between">
              <p className="text-sm text-muted-foreground mb-6">
                Master modern web development with React, Node.js, and databases. Build real-world applications from
                scratch.
              </p>
              <Button className="w-full cursor-pointer transform transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                <Link href="/dashboard/nodejs">
                Select Course
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="group shadow-zinc-950/5 flex flex-col h-full">
            <CardHeader className="pb-3">
              <div className="relative mx-auto h-48 w-full overflow-hidden rounded-lg">
                <Image src="https://hiteshchoudhary.com/images/python-udemy.jpg"
                priority={false}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                alt="Data Science Course"
                fill
                className="object-cover" />
              </div>
              <h3 className="mt-6 text-xl font-medium">Data Science & Analytics With Python</h3>
            </CardHeader>
            <CardContent className="text-center flex-1 flex flex-col justify-between">
              <p className="text-sm text-muted-foreground mb-6">
                Learn Python, machine learning, and data visualization. Transform raw data into actionable insights.
              </p>
              <Button className="w-full cursor-pointer transform transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                <Link href="/dashboard/python">
                Select Course
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default courseSelect