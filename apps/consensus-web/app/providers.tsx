'use client';

import { SWRConfig } from 'swr';
import { Auth0Provider } from '@auth0/nextjs-auth0';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SocketProvider } from './contexts/SocketContext';
import { authenticatedFetch } from './utils/authenticatedFetch';

const fetcher = (url: string) => {
  return authenticatedFetch(url).then((res) => res.json());
};

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
        <ThemeProvider>
          <AuthProvider>
            <SocketProvider>
              <AppProvider>
                {children}
              </AppProvider>
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </SWRConfig>
    </Auth0Provider>
  );
}
