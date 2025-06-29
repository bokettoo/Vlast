// Environment configuration for dev/prod mode switching
export const config = {
  // Always use real GitHub API data
  isDevelopment: false,
  
  // GitHub API configuration
  githubApi: {
    baseUrl: 'https://api.github.com',
    tokenKey: 'github_access_token', // localStorage key
  },
  
  // Required GitHub token scopes
  requiredScopes: ['repo', 'delete_repo', 'user'],
} as const;

export type Config = typeof config;