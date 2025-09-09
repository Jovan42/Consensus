import useSWR from 'swr';
import { authenticatedFetch } from '../utils/authenticatedFetch';

export interface Appeal {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  readByUserId: string | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  readByUser?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface AppealResponse {
  success: boolean;
  data: Appeal | null;
}

export interface AppealsResponse {
  success: boolean;
  data: Appeal[];
}

export function useMyAppeal() {
  const { data, error, isLoading, mutate } = useSWR<AppealResponse>(
    '/appeals/my',
    (url) => authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}${url}`)
      .then(res => res.json()),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0
    }
  );

  return {
    appeal: data?.data,
    isLoading,
    error,
    mutate
  };
}

export function useAllAppeals() {
  const { data, error, isLoading, mutate } = useSWR<AppealsResponse>(
    '/appeals/all',
    (url) => authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}${url}`)
      .then(res => res.json()),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0
    }
  );

  return {
    appeals: data?.data || [],
    isLoading,
    error,
    mutate
  };
}

export async function createAppeal(message: string): Promise<AppealResponse> {
  const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/appeals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  return response.json();
}

export async function updateAppealStatus(appealId: string, isRead: boolean): Promise<AppealResponse> {
  const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/appeals/${appealId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isRead }),
  });

  return response.json();
}
