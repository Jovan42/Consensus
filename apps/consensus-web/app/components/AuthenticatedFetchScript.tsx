'use client';

import { useEffect } from 'react';

export const AuthenticatedFetchScript = () => {
  useEffect(() => {
    // Store the original fetch function
    const originalFetch = window.fetch;
    
    // Override the global fetch function
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input.toString();
      
      // Check if this is a backend API call that needs authentication
      const isBackendApiCall = url.includes('localhost:3001/api/') || 
                              url.includes('/api/') || 
                              (url.startsWith('http') && url.includes('/api/'));
      
      if (isBackendApiCall) {
        // Get user info from localStorage
        let userInfo = null;
        try {
          const testUser = localStorage.getItem('testUser');
          const auth0User = localStorage.getItem('auth0User');
          
          if (testUser) {
            const user = JSON.parse(testUser);
            userInfo = {
              email: user.email,
              name: user.name,
              role: user.role,
              sub: user.sub,
              type: 'test'
            };
          } else if (auth0User) {
            const user = JSON.parse(auth0User);
            userInfo = {
              email: user.email,
              name: user.name,
              role: user.role || 'member',
              sub: user.sub,
              type: 'auth0'
            };
          }
        } catch (error) {
          console.error('Error parsing user info:', error);
        }
        
        // Add authentication headers
        const headers = new Headers(init?.headers);
        headers.set('Content-Type', 'application/json');
        
        if (userInfo) {
          headers.set('X-User-Email', userInfo.email);
          headers.set('X-User-Name', userInfo.name);
          headers.set('X-User-Role', userInfo.role);
          headers.set('X-User-Sub', userInfo.sub);
          headers.set('X-User-Type', userInfo.type);
        }
        
        // Make the request with authentication headers
        const response = await originalFetch(input, {
          ...init,
          headers,
        });
        
        // Handle authentication errors
        if (!response.ok && response.status === 401) {
          // Clear any stored user data and redirect to login
          localStorage.removeItem('testUser');
          localStorage.removeItem('auth0User');
          window.location.href = '/';
          throw new Error('Authentication required. Please log in.');
        }
        
        return response;
      }
      
      // For non-API calls, use the original fetch
      return originalFetch(input, init);
    };
    
    // Cleanup function to restore original fetch
    return () => {
      window.fetch = originalFetch;
    };
  }, []);
  
  return null; // This component doesn't render anything
};
