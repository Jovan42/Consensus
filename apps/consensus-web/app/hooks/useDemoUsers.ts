import useSWR from 'swr';

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role: 'admin' | 'user';
  isActive: boolean;
  banned: boolean;
  banReason?: string;
  bannedAt?: string;
  emailVerified: boolean;
  timezone?: string;
  locale?: string;
  createdAt: string;
  updatedAt: string;
}

export function useDemoUsers() {
  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: DemoUser[]; count: number }>(
    '/users',
    (url) => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      return fetch(`${baseUrl}${url}`).then(res => res.json());
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0
    }
  );

  return {
    users: data?.data || [],
    count: data?.count || 0,
    isLoading,
    error,
    mutate
  };
}
