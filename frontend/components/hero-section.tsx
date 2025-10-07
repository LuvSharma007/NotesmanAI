'use client'
import React from 'react'
import 'swiper/css'
import 'swiper/css/autoplay'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-coverflow'
import Link from 'next/link'
import { ArrowRight, Rocket, } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GridBackgroundDemo } from './ui/bg-grid'

export default function HeroSection() {
    return (
        <>
        <GridBackgroundDemo>
            <main className="overflow-hidden min-h-screen">
                <section className="relative flex items-center justify-center">
                    <div className="relative py-24 lg:py-28">
                        <div className="mx-auto max-w-7xl px-6 md:px-12">
                            <div className="text-center sm:mx-auto sm:w-10/12 lg:mr-auto lg:mt-0 lg:w-4/5">
                                <Link
                                    href="/"
                                    className="rounded-(--radius) mx-auto flex w-fit items-center gap-2 border p-1 pr-3">
                                    <span className="text-1xl">Ready To become a Notesman</span>
                                    <span className="bg-(--color-border) block h-4 w-px"></span>

                                    <ArrowRight className="size-4" />
                                    {/* <span className="size-3 rounded-full bg-green-500"></span> */}

                                </Link>

                                <h1 className="mt-8 text-6xl font-semibold md:text-5xl xl:text-5xl xl:[line-height:1.125] font-sans">
                                    Your personal AI knowledge companion
                                </h1>
                                <p className="mx-auto mt-8 hidden max-w-2xl text-wrap text-lg sm:block font-sans">Ask questions, get summaries, and turn raw notes into actionable knowledge</p>
                            
                                <div className="mt-20">
                                    <Button
                                        size="lg"
                                        asChild>
                                        <Link href="#">
                                            <Rocket className="relative size-4" />
                                            <span className="text-nowrap">Be a Notesman</span>
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            </GridBackgroundDemo>
        </>
    )
}