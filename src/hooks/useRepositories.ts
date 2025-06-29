import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { githubApi } from '@/utils/api';
import { QUERY_KEYS, MUTATION_KEYS } from '@/types';
import type { Repository, CreateRepositoryRequest, UpdateRepositoryRequest } from '@/types';

export const useRepositories = () => {
  return useQuery({
    queryKey: QUERY_KEYS.repositories,
    queryFn: () => githubApi.fetchRepositories(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useRepository = (owner: string, repo: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.repository(owner, repo),
    queryFn: () => githubApi.fetchRepository(owner, repo),
    enabled: !!owner && !!repo,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateRepository = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: MUTATION_KEYS.createRepository,
    mutationFn: (params: CreateRepositoryRequest) => githubApi.createRepository(params),
    onSuccess: () => {
      // Invalidate repositories query to refetch the list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.repositories });
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
      // Invalidate repositories query to refetch the list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.repositories });
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
  });
};