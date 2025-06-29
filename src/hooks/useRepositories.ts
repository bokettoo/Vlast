import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { githubApi } from '@/utils/api';
import { QUERY_KEYS, MUTATION_KEYS } from '@/types';
import type { CreateRepositoryRequest, UpdateRepositoryRequest } from '@/types';

export const useRepositories = () => {
  return useQuery({
    queryKey: QUERY_KEYS.repositories,
    queryFn: () => githubApi.fetchRepositories(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    retry: (failureCount, error) => {
      // Don't retry on 401/403 errors (authentication issues)
      if (error instanceof Error && 'status' in error) {
        const status = (error as any).status;
        if (status === 401 || status === 403) {
          return false;
        }
      }
      return failureCount < 3;
    },
  });
};

export const useRepository = (owner: string, repo: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.repository(owner, repo),
    queryFn: () => githubApi.fetchRepository(owner, repo),
    enabled: !!owner && !!repo,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useCreateRepository = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: MUTATION_KEYS.createRepository,
    mutationFn: (params: CreateRepositoryRequest) => githubApi.createRepository(params),
    onSuccess: () => {
      // Invalidate and refetch repositories query
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.repositories });
      // Also refetch user data since repo count might have changed
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user });
    },
    onError: (error) => {
      console.error('Failed to create repository:', error);
    },
  });
};

export const useUpdateRepository = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: MUTATION_KEYS.updateRepository,
    mutationFn: async ({ 
      owner, 
      repo, 
      updates 
    }: { 
      owner: string; 
      repo: string; 
      updates: UpdateRepositoryRequest;
    }) => {
      return githubApi.updateRepository(owner, repo, updates);
    },
    onSuccess: (_, { owner, repo }) => {
      // Invalidate specific repository and repositories list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.repository(owner, repo) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.repositories });
    },
    onError: (error) => {
      console.error('Failed to update repository:', error);
    },
  });
};

export const useDeleteRepository = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: MUTATION_KEYS.deleteRepository,
    mutationFn: ({ owner, repo }: { owner: string; repo: string }) => {
      return githubApi.deleteRepository(owner, repo);
    },
    onSuccess: () => {
      // Invalidate and refetch repositories query
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.repositories });
      // Also refetch user data since repo count might have changed
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user });
    },
    onError: (error) => {
      console.error('Failed to delete repository:', error);
    },
  });
};

export const useToggleRepositoryVisibility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: MUTATION_KEYS.toggleVisibility,
    mutationFn: ({ 
      owner, 
      repo, 
      makePrivate 
    }: { 
      owner: string; 
      repo: string; 
      makePrivate: boolean;
    }) => {
      return githubApi.toggleRepositoryVisibility(owner, repo, makePrivate);
    },
    onSuccess: (_, { owner, repo }) => {
      // Invalidate specific repository and repositories list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.repository(owner, repo) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.repositories });
    },
    onError: (error) => {
      console.error('Failed to toggle repository visibility:', error);
    },
  });
};