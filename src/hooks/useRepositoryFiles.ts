import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { githubApi } from '@/utils/api';
import { QUERY_KEYS, MUTATION_KEYS } from '@/types';
import type { UploadFileRequest, DeleteFileRequest } from '@/types';

export const useRepositoryContents = (owner: string, repo: string, path?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.repositoryContents(owner, repo, path),
    queryFn: () => githubApi.getRepositoryContents(owner, repo, path),
    enabled: !!owner && !!repo,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: MUTATION_KEYS.uploadFile,
    mutationFn: ({
      owner,
      repo,
      params,
    }: {
      owner: string;
      repo: string;
      params: UploadFileRequest;
    }) => {
      return githubApi.uploadFile(owner, repo, params);
    },
    onSuccess: (_, { owner, repo }) => {
      // Invalidate repository contents to refetch the file list
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.repositoryContents(owner, repo),
      });
    },
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: MUTATION_KEYS.deleteFile,
    mutationFn: ({
      owner,
      repo,
      params,
    }: {
      owner: string;
      repo: string;
      params: DeleteFileRequest;
    }) => {
      return githubApi.deleteFile(owner, repo, params);
    },
    onSuccess: (_, { owner, repo }) => {
      // Invalidate repository contents to refetch the file list
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.repositoryContents(owner, repo),
      });
    },
  });
};