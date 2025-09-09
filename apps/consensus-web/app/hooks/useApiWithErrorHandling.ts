'use client';

import { useCallback } from 'react';
import { useError } from '../contexts/ErrorContext';
import { authenticatedFetch } from '../utils/authenticatedFetch';

export const useApiWithErrorHandling = () => {
  const { handleHttpError, showSuccess } = useError();

  const apiCall = useCallback(async <T = any>(
    url: string, 
    options: RequestInit = {},
    context?: string,
    showSuccessMessage?: boolean,
    successMessage?: string
  ): Promise<T | null> => {
    try {
      const response = await authenticatedFetch(url, options);
      
      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (parseError) {
          console.warn('Could not parse error response as JSON:', parseError);
        }
        
        const error = {
          response: {
            status: response.status,
            statusText: response.statusText,
            data: errorData
          }
        };
        
        handleHttpError(error, context);
        return null;
      }

      const data = await response.json();
      
      if (showSuccessMessage && successMessage) {
        showSuccess(successMessage);
      }
      
      return data;
    } catch (error) {
      handleHttpError(error, context);
      return null;
    }
  }, [handleHttpError, showSuccess]);

  const get = useCallback(<T = any>(url: string, context?: string): Promise<T | null> => {
    return apiCall<T>(url, { method: 'GET' }, context);
  }, [apiCall]);

  const post = useCallback(<T = any>(
    url: string, 
    data?: any, 
    context?: string,
    showSuccessMessage?: boolean,
    successMessage?: string
  ): Promise<T | null> => {
    return apiCall<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, context, showSuccessMessage, successMessage);
  }, [apiCall]);

  const put = useCallback(<T = any>(
    url: string, 
    data?: any, 
    context?: string,
    showSuccessMessage?: boolean,
    successMessage?: string
  ): Promise<T | null> => {
    return apiCall<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, context, showSuccessMessage, successMessage);
  }, [apiCall]);

  const del = useCallback(<T = any>(
    url: string, 
    context?: string,
    showSuccessMessage?: boolean,
    successMessage?: string
  ): Promise<T | null> => {
    return apiCall<T>(url, { method: 'DELETE' }, context, showSuccessMessage, successMessage);
  }, [apiCall]);

  return {
    apiCall,
    get,
    post,
    put,
    delete: del,
  };
};
