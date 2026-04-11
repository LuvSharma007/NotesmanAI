"use client"
import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogTitle, } from './ui/dialog'
import Link from 'next/link';
import { Button } from './ui/button';
import { ChartColumnBig, Check, Settings, User, Wallet } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';

interface UserInfoDialogProps {
    isOpen: boolean,
    onClose: (open: boolean) => void;
}

interface UserUsageResponse{
    _id:string,
    userId:string,
    tokens:number,
    query:number
}

const UserInfoDialog = ({
    isOpen, onClose
}: UserInfoDialogProps) => {

    const [activeHash, setActiveHash] = useState("");
    const { data: session } = authClient.useSession()
    const [usage,setUsage] = useState<UserUsageResponse | null>(null)   

    useEffect(() => {
        if (typeof window !== "undefined") {
            setActiveHash(window.location.hash);
            const handleHashChange = () => setActiveHash(window.location.hash)
            window.addEventListener('hashchange', handleHashChange)
            return () => window.removeEventListener('hashchange', handleHashChange)
        }
    }, [isOpen])

    const handleUsage = async ()=>{
        if(usage){
            return;
        }
        try {
            const userUsageResponse = await fetch(`/api/v1/usage/getUsage`,{
                credentials:"include"
            })

             if (!userUsageResponse.ok) {
                const errorData = await userUsageResponse.json();
                toast.error(errorData.message || "Error fetching usage data")
                return;
            }

            const usageData = await userUsageResponse.json()
            setUsage(usageData.usage)
        } catch (error) {
            toast.error("Error fetching user usage data")
        }
    }

    const renderContent = () => {
        switch (activeHash) {
            case '#settings/subscription':
                return (
                    <div className="flex-1 space-y-4 p-4">
                        <h1 className='text-2xl font-semibold border-b pb-3'>Subscription Plans</h1>
                        <div className='grid grid-cols-2 gap-4'>
                            <Card className="flex flex-col h-full">
                                <CardHeader>
                                    <CardTitle className="font-semibold text-lg">Free</CardTitle>
                                    <span className="mt-2 block text-3xl font-bold">$0<span className="text-sm font-normal text-muted-foreground"> / mo</span></span>
                                </CardHeader>

                                <CardContent className="space-y-4 flex-1">
                                    <hr className="border-dashed" />

                                    <ul className="space-y-3 text-sm">
                                        {['Basic Analytics Dashboard', '5GB Cloud Storage', 'Email and Chat Support'].map((item, index) => (
                                            <li
                                                key={index}
                                                className="flex items-start gap-3">
                                                <Check className="size-4 mt-0.5 flex-shrink-0 text-green-600" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>

                                <CardFooter>
                                    <Button
                                        asChild
                                        disabled
                                        variant="outline"
                                        className="w-full">
                                        <Link aria-disabled href="">Current Plan</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                            <Card className="flex flex-col h-full border-primary/50 bg-primary/5">
                                <CardHeader>
                                    <CardTitle className="font-semibold text-lg">Pro</CardTitle>
                                    <span className="mt-2 block text-3xl font-bold">$10<span className="text-sm font-normal text-muted-foreground"> / mo</span></span>
                                </CardHeader>

                                <CardContent className="space-y-4 flex-1">
                                    <hr className="border-dashed" />

                                    <ul className="space-y-3 text-sm">
                                        {['Every thing of Free Plan', 'Soon updated'].map((item, index) => (
                                            <li
                                                key={index}
                                                className="flex items-start gap-3">
                                                <Check className="size-4 mt-0.5 flex-shrink-0 text-green-600" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>

                                <CardFooter>
                                    <Button
                                        asChild
                                        className="w-full">
                                        <Link href="">Get Pro Plan</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                );
            case '#settings/usage':
                return (
                    <div className='w-150 flex-1 space-y-4 p-4'>
                        <h1 className='text-2xl font-semibold border-b pb-3'>Usage Overview</h1>
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-semibold">Your Usage</CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium text-sm">Tokens Usage</h3>
                                        <span className="text-xs text-muted-foreground">{usage?.tokens} / 100,000</span>
                                    </div>
                                    <div className="w-full bg-secondary rounded-full h-2">
                                        <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium text-sm">Query Usage</h3>
                                        <span className="text-xs text-muted-foreground">{usage?.query} / 100</span>
                                    </div>
                                    <div className="w-full bg-secondary rounded-full h-2">
                                        <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );
            case '#settings':
            default:
                return (
                    <div className='w-150 flex-1 space-y-4 p-4'>
                        <h1 className='text-2xl font-semibold border-b pb-3'>Account Settings</h1>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                    <User size={20} />
                                    Profile
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 border-b">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Username</p>
                                            <p className="font-medium">{session?.user.username}</p>
                                        </div>
                                        <Button variant="outline" size="sm">Edit</Button>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{session?.user.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Member Since</p>
                                        <p className="font-medium">{session?.user.createdAt.toDateString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                    <Wallet size={20} />
                                    Subscription & Billing
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Current Plan</p>
                                        <p className="font-medium">Free</p>
                                    </div>
                                    <Button variant="outline" size="sm">Upgrade</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )
        }
    }

    const workspaceItems = [
        { name: "Settings", href: '#settings', logo: <Settings /> },
        { name: "Subscription", href: '#settings/subscription', logo: <Wallet /> },
        { name: "Usage", href: '#settings/usage', logo: <ChartColumnBig /> , onClickHandle:handleUsage},
    ]

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent aria-describedby={undefined}
                    className='sm:max-w-4xl h-160'
                >
                    <div className='flex'>
                        <div className='border-r w-50 flex flex-col'>
                            <DialogTitle>Workspace</DialogTitle>
                            {workspaceItems.map((item, index) => (
                                <Button
                                variant={"outline"}
                                key={index}
                                onClick={item.onClickHandle}
                                    className='list-none flex m-2 p-2 bg-card'
                                >
                                    <Link
                                        className='flex gap-2 items-left'
                                        href={item.href}
                                        onClick={() => setActiveHash(item.href)}
                                    >

                                        {item.logo}
                                        <span>{item.name}</span>
                                    </Link>
                                </Button>
                            ))}
                        </div>
                        <div>
                            {renderContent()}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default UserInfoDialog