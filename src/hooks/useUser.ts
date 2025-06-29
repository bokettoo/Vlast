import { useQuery } from '@tanstack/react-query';
import { githubApi } from '@/utils/api';
import { QUERY_KEYS } from '@/types';
import type { GitHubUser } from '@/types';

export const useUser = () => {
  return useQuery({
    queryKey: QUERY_KEYS.user,
    queryFn: () => githubApi.getCurrentUser(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};