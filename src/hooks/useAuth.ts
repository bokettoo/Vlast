import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { config } from '@/config/environment';
import { githubApi } from '@/utils/api';

export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isAuthenticated = useCallback((): boolean => {
    const token = localStorage.getItem(config.githubApi.tokenKey);
    return Boolean(token);
  }, []);

  const login = useCallback(async (token: string): Promise<boolean> => {
    try {
      const isValid = await githubApi.validateToken(token);
      if (!isValid) {
        throw new Error('Invalid token or insufficient permissions');
      }

      localStorage.setItem(config.githubApi.tokenKey, token);
      return true;
    } catch (error) {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(config.githubApi.tokenKey);
    queryClient.clear(); // Clear all cached data
    navigate('/');
  }, [navigate, queryClient]);

  const getToken = useCallback((): string | null => {
    return localStorage.getItem(config.githubApi.tokenKey);
  }, []);

  return {
    isAuthenticated,
    login,
    logout,
    getToken,
  };
};