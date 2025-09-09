'use client';

import { SWRConfig } from 'swr';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SocketProvider } from './contexts/SocketContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ErrorProvider } from './contexts/ErrorContext';
import { authenticatedFetch } from './utils/authenticatedFetch';

const fetcher = async (url: string) => {
  const response = await authenticatedFetch(url);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = {
      response: {
        status: response.status,
        statusText: response.statusText,
        data: errorData
      }
    };
    
    // We'll handle this error in the component level using useError
    throw error;
  }
  
  return response.json();
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
        <ErrorProvider>
          <AuthProvider>
            <SocketProvider>
              <NotificationProvider>
                <AppProvider>
                  {children}
                </AppProvider>
              </NotificationProvider>
            </SocketProvider>
          </AuthProvider>
        </ErrorProvider>
      </ThemeProvider>
    </SWRConfig>
  );
}
