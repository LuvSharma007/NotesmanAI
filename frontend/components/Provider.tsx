"use client"

import {QueryClient} from "@tanstack/react-query"
import {PersistQueryClientProvider} from "@tanstack/react-query-persist-client"
import {createAsyncStoragePersister} from '@tanstack/query-async-storage-persister'
import React, { useEffect, useState } from "react"


interface Props{
    children:React.ReactNode
}

const queryClient = new QueryClient({
    defaultOptions:{
        queries:{
            gcTime:1000 * 60 * 60 * 24,
            staleTime:1000 * 60 * 5,
        }
    }
})

export default function Providers({children}:Props){
    const [config, setConfig] = useState<{
    client: QueryClient;
    persister: any;
  } | null>(null);

  useEffect(() => {
    
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          gcTime: 1000 * 60 * 60 * 24,
        },
      },
    });

    const persister = createAsyncStoragePersister({
      storage: window.localStorage,
      throttleTime: 1000,
      key:"ChatHistory"
    });

    setConfig({ client, persister });
  }, []);

  if(!config) return null

    return (
        <PersistQueryClientProvider 
        client={queryClient}
        persistOptions={{ persister: config.persister }}
        >
            {children}
        </PersistQueryClientProvider>
    )
}