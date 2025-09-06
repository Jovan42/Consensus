'use client';

import { SWRConfig } from 'swr';
import { AppProvider } from './context/AppContext';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
      }}
    >
      <AppProvider>
        {children}
      </AppProvider>
    </SWRConfig>
  );
}
