'use client';

import { SWRConfig } from 'swr';
import { Auth0Provider } from '@auth0/nextjs-auth0';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './contexts/AuthContext';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Auth0Provider>
      <SWRConfig
        value={{
          fetcher,
          revalidateOnFocus: false,
          revalidateOnReconnect: true,
          errorRetryCount: 3,
          errorRetryInterval: 5000,
        }}
      >
        <AuthProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </AuthProvider>
      </SWRConfig>
    </Auth0Provider>
  );
}
