"use client";

import * as React from "react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import {clientEnv} from "@/lib/env";

export function QueryProvider({children}: { children: React.ReactNode }) {
  const [client] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      {clientEnv.NEXT_PUBLIC_NODE_ENV !== "production" && (
        <ReactQueryDevtools initialIsOpen={false}/>
      )}
    </QueryClientProvider>
  );
}
