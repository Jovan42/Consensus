import { requestDeduplication } from './requestDeduplication';

// Helper function to get user info from localStorage
const getUserInfo = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const testUser = localStorage.getItem('testUser');
    const auth0User = localStorage.getItem('auth0User');
    
    if (testUser) {
      const user = JSON.parse(testUser);
      return {
        email: user.email,
        name: user.name,
        role: user.role,
        sub: user.sub,
        type: 'test'
      };
    }
    
    if (auth0User) {
      const user = JSON.parse(auth0User);
      return {
        email: user.email,
        name: user.name,
        role: user.role || 'member',
        sub: user.sub,
        type: 'auth0'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing user info:', error);
    return null;
  }
};

// Helper function to create headers with user info
const createAuthHeaders = () => {
  const headers: Record<string, string> = {};
  
  const userInfo = getUserInfo();
  if (userInfo) {
    headers['X-User-Email'] = userInfo.email;
    headers['X-User-Name'] = userInfo.name;
    headers['X-User-Role'] = userInfo.role;
    headers['X-User-Sub'] = userInfo.sub;
    headers['X-User-Type'] = userInfo.type;
  }
  
  return headers;
};

// Check if a URL is a backend API call that needs authentication
const isBackendApiCall = (url: string): boolean => {
  return url.includes('localhost:3001/api/') || 
         url.includes('/api/') || 
         (url.startsWith('http') && url.includes('/api/'));
};

// Enhanced fetch function that automatically adds authentication headers
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // If this is a backend API call, add authentication headers
  if (isBackendApiCall(url)) {
    const authHeaders = createAuthHeaders();
    
    // Merge with existing headers
    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...authHeaders,
      ...options.headers,
    };
    
    const response = await requestDeduplication.deduplicatedFetch(url, {
      ...options,
      headers,
    });
    
    // Handle authentication errors
    if (!response.ok && response.status === 401) {
      // Clear any stored user data and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('testUser');
        localStorage.removeItem('auth0User');
        window.location.href = '/';
      }
      throw new Error('Authentication required. Please log in.');
    }
    
    return response;
  }
  
  // For non-API calls, use deduplicated fetch
  return requestDeduplication.deduplicatedFetch(url, options);
};

// Export the helper functions for use in other parts of the app
export { getUserInfo, createAuthHeaders, isBackendApiCall };
