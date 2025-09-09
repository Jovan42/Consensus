'use client';

import useSWR, { SWRConfiguration } from 'swr';
import { useError } from '../contexts/ErrorContext';
import { useEffect } from 'react';

interface UseSWRWithErrorHandlingOptions extends SWRConfiguration {
  context?: string; // Context for error messages
  showErrorToast?: boolean; // Whether to show error toast (default: true)
}

export function useSWRWithErrorHandling<T = any>(
  key: string | null,
  fetcher?: (url: string) => Promise<T>,
  options: UseSWRWithErrorHandlingOptions = {}
) {
  const { context, showErrorToast = true, ...swrOptions } = options;
  const { handleHttpError } = useError();

  const swr = useSWR(key, fetcher, {
    ...swrOptions,
    onError: (error) => {
      if (showErrorToast) {
        handleHttpError(error, context);
      }
      
      // Call the original onError if provided
      if (swrOptions.onError) {
        swrOptions.onError(error);
      }
    },
  });

  return swr;
}
