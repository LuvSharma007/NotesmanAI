"use client"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ChatsProvider } from "@/context/chatsContext";
import { SourcesProvider } from "@/context/SourceContext";
import { UploadDialogProvider } from "@/context/UploadDialogContext";
import QueryProvider from "@/components/Provider";
import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import Header from "@/components/Header";

export default function ChatLayout({ children }: { children: React.ReactNode }) {

  return (
    <QueryProvider>
      <SourcesProvider>
        <UploadDialogProvider>
          <ChatsProvider>
            <SidebarProvider defaultOpen={false}>
              <div className="flex h-screen w-full overflow-hidden bg-background">
                <AppSidebar />
                <SidebarInset className="flex flex-col flex-1 min-w-0 overflow-hidden">
                  <Header />
                  <main className="flex-1 min-h-0 overflow-hidden flex flex-col">
                    <div className="flex-1 min-h-0 overflow-hidden mx-auto w-full">
                      {children}
                    </div>
                  </main>
                </SidebarInset>
              </div>
            </SidebarProvider>
          </ChatsProvider>
        </UploadDialogProvider>
      </SourcesProvider>
    </QueryProvider>
  )
}


