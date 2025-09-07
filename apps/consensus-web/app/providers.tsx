'use client';

import { SWRConfig } from 'swr';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SocketProvider } from './contexts/SocketContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { authenticatedFetch } from './utils/authenticatedFetch';

const fetcher = (url: string) => {
  return authenticatedFetch(url).then((res) => res.json());
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        // Add deduplication for SWR to reduce requests
        dedupingInterval: 2000,
      }}
    >
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <NotificationProvider>
              <AppProvider>
                {children}
              </AppProvider>
            </NotificationProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </SWRConfig>
  );
}
