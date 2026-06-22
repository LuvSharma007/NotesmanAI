
import { Ai2, HuggingFace, MCP, ModelScope, OpenClaw } from '@lobehub/icons'
import { Brain, Cpu, DownloadCloud, Fingerprint, Globe, Link2, Pencil, Settings2, Sparkles, Zap } from 'lucide-react'
import Link from 'next/link'

export default function Features() {
    return (
        <section className="py-12 md:py-20 font-sans" id='features' >
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
                    <h2 className="text-balance text-4xl font-medium lg:text-5xl">Features</h2>
                    <p>Notesman is evolving to be more than just the LLM model.</p>
                </div>

                <div className="relative mx-auto grid max-w-4xl divide-x divide-y border *:p-12 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <HuggingFace className="size-4"/>   
                            <h3 className="text-sm font-medium">Open Source Models</h3>
                        </div>
                        <p className="text-sm">supports all LLM models.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Globe className="size-4" />
                            <h3 className="text-sm font-medium">Web Search</h3>
                        </div>
                        <p className="text-sm">Get lastest snformation from web.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Brain className="size-4" />

                            <h3 className="text-sm font-medium">Deep Thinking</h3>
                        </div>
                        <p className="text-sm">supports deep thinking mode for complex tasks.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Fingerprint className="size-4" />

                            <h3 className="text-sm font-medium">Security</h3>
                        </div>
                        <p className="text-sm">use Notesman locally with open source models.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <DownloadCloud className="size-4" />
                            <h3 className="text-sm font-medium">Documents</h3>
                            <Link2 className='size-4'/>
                            <h3 className="text-sm font-medium">URL</h3>

                        </div>
                        <p className="text-sm">Upload URL & documents of any Formate.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <MCP className="size-4" />

                            <h3 className="text-sm font-medium">Connectors</h3>
                        </div>
                        <p className="text-sm">supports MCP to help developers and businesses.</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
