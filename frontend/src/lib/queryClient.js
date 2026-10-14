import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // refetch data after 5 min (in ms)
      gcTime: 5 * 60 * 1000,    // data stays in cache for 5 min, deleted after
      refetchOnWindowFocus: false,  // does not refresh after switching browser tabs
      retry: (failureCount, error) => {
        const status = error?.response?.status;
        return failureCount < 1 && (!status || status >= 500);
      },
    },
  },
});
