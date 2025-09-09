'use client';

import { useError } from '../contexts/ErrorContext';

export interface Toast {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

export const useToast = () => {
  const { showSuccess, showError, showWarning, showInfo, showToast } = useError();

  const toast = (toastData: Toast) => {
    showToast(toastData);
  };

  return {
    toast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
