import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Reusable API request helper
export async function apiRequest(
  method: string,
  url: string,
  data?: any,
  options: RequestInit = {}
) {
  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  };
  if (data) {
    fetchOptions.body = JSON.stringify(data);
  }
  const response = await fetch(url, fetchOptions);
  return response;
}
