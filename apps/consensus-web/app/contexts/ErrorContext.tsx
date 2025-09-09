'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast } from '../components/ui/Toast';
import ToastContainer from '../components/ui/ToastContainer';

interface ErrorContextType {
  showError: (message: string, title?: string, duration?: number) => void;
  showSuccess: (message: string, title?: string, duration?: number) => void;
  showWarning: (message: string, title?: string, duration?: number) => void;
  showInfo: (message: string, title?: string, duration?: number) => void;
  showToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
  handleHttpError: (error: any, context?: string) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = generateId();
    const newToast: Toast = {
      id,
      duration: 5000, // Default 5 seconds
      ...toast,
    };
    
    setToasts(prev => [...prev, newToast]);
  }, []);

  const showError = useCallback((message: string, title?: string, duration?: number) => {
    showToast({
      type: 'error',
      title: title || 'Error',
      message,
      duration: duration || 7000, // Errors stay longer
    });
  }, [showToast]);

  const showSuccess = useCallback((message: string, title?: string, duration?: number) => {
    showToast({
      type: 'success',
      title: title || 'Success',
      message,
      duration: duration || 3000,
    });
  }, [showToast]);

  const showWarning = useCallback((message: string, title?: string, duration?: number) => {
    showToast({
      type: 'warning',
      title: title || 'Warning',
      message,
      duration: duration || 5000,
    });
  }, [showToast]);

  const showInfo = useCallback((message: string, title?: string, duration?: number) => {
    showToast({
      type: 'info',
      title: title || 'Info',
      message,
      duration: duration || 4000,
    });
  }, [showToast]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const handleHttpError = useCallback((error: any, context?: string) => {
    console.error('HTTP Error:', JSON.stringify(error, null, 2));
    
    let title = 'Error';
    let message = 'An unexpected error occurred';
    let duration = 7000;

    // Handle different types of errors
    if (error?.response?.status) {
      const status = error.response.status;
      const statusText = error.response.statusText || '';
      
      switch (status) {
        case 400:
          title = 'Bad Request';
          message = error.response.data?.message || 'Invalid request. Please check your input.';
          break;
        case 401:
          title = 'Unauthorized';
          message = 'You are not authorized to perform this action. Please log in again.';
          duration = 8000;
          break;
        case 403:
          title = 'Access Denied';
          message = error.response.data?.message || 'You do not have permission to access this resource.';
          duration = 8000;
          break;
        case 404:
          title = 'Not Found';
          message = error.response.data?.message || 'The requested resource was not found.';
          break;
        case 409:
          title = 'Conflict';
          message = error.response.data?.message || 'This action conflicts with existing data.';
          break;
        case 422:
          title = 'Validation Error';
          message = error.response.data?.message || 'Please check your input and try again.';
          break;
        case 429:
          title = 'Too Many Requests';
          message = 'You are making requests too quickly. Please wait a moment and try again.';
          duration = 10000;
          break;
        case 500:
          title = 'Server Error';
          message = 'The server encountered an error. Please try again later.';
          duration = 10000;
          break;
        case 502:
        case 503:
        case 504:
          title = 'Service Unavailable';
          message = 'The service is temporarily unavailable. Please try again later.';
          duration = 10000;
          break;
        default:
          title = `Error ${status}`;
          message = error.response.data?.message || statusText || 'An error occurred';
      }
    } else if (error?.message) {
      // Network or other errors
      if (error.message.includes('Network Error') || error.message.includes('fetch')) {
        title = 'Network Error';
        message = 'Unable to connect to the server. Please check your internet connection.';
        duration = 10000;
      } else if (error.message.includes('timeout')) {
        title = 'Request Timeout';
        message = 'The request took too long to complete. Please try again.';
        duration = 8000;
      } else {
        message = error.message;
      }
    }

    // Add context if provided
    if (context) {
      title = `${title} - ${context}`;
    }

    showError(message, title, duration);
  }, [showError]);

  const value: ErrorContextType = {
    showError,
    showSuccess,
    showWarning,
    showInfo,
    showToast,
    dismissToast,
    handleHttpError,
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ErrorContext.Provider>
  );
};

export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};
