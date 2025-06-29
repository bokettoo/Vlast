import { config } from '../config/environment';
import { Repository } from '../data/fakeRepos';

export class GitHubApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'GitHubApiError';
  }
}

interface FileContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  content: string;
  encoding: string;
}

interface UpdateRepoParams {
  name?: string;
  description?: string;
  private?: boolean;
}

interface UploadFileParams {
  path: string;
  content: string;
  message: string;
  sha?: string;
}

interface CreateRepoParams {
  name: string;
  description?: string;
  private?: boolean;
  auto_init?: boolean;
}

export const githubApi = {
  async getHeaders(): Promise<HeadersInit> {
    const token = localStorage.getItem(config.githubApi.tokenKey);
    if (!token) {
      throw new GitHubApiError('No GitHub token found. Please submit your token first.');
    }
    
    return {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
  },

  async fetchRepositories(): Promise<Repository[]> {
    const headers = await this.getHeaders();
    const response = await fetch(`${config.githubApi.baseUrl}/user/repos?per_page=100&sort=updated`, {
      headers,
    });

    if (!response.ok) {
      throw new GitHubApiError(`Failed to fetch repositories: ${response.statusText}`, response.status);
    }

    return response.json();
  },

  async createRepository(params: CreateRepoParams): Promise<Repository> {
    const headers = await this.getHeaders();
    const response = await fetch(`${config.githubApi.baseUrl}/user/repos`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: params.name,
        description: params.description || '',
        private: params.private || false,
        auto_init: params.auto_init || false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 422 && errorData.errors) {
        const nameError = errorData.errors.find((error: any) => 
          error.field === 'name' && error.code === 'already_exists'
        );
        if (nameError) {
          throw new GitHubApiError(`Repository name '${params.name}' already exists for your account. Please choose a different name.`, response.status);
        }
      }
      
      throw new GitHubApiError(
        errorData.message || `Failed to create repository: ${response.statusText}`, 
        response.status
      );
    }

    return response.json();
  },

  async toggleRepositoryVisibility(owner: string, repo: string, makePrivate: boolean): Promise<Repository> {
    const headers = await this.getHeaders();
    const response = await fetch(`${config.githubApi.baseUrl}/repos/${owner}/${repo}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        private: makePrivate,
      }),
    });

    if (!response.ok) {
      throw new GitHubApiError(`Failed to update repository visibility: ${response.statusText}`, response.status);
    }

    return response.json();
  },

  async updateRepository(owner: string, repo: string, updates: UpdateRepoParams): Promise<Repository> {
    const headers = await this.getHeaders();
    const response = await fetch(`${config.githubApi.baseUrl}/repos/${owner}/${repo}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new GitHubApiError(
        errorData.message || `Failed to update repository: ${response.statusText}`, 
        response.status
      );
    }

    return response.json();
  },

  async deleteRepository(owner: string, repo: string): Promise<void> {
    const headers = await this.getHeaders();
    const response = await fetch(`${config.githubApi.baseUrl}/repos/${owner}/${repo}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new GitHubApiError(`Failed to delete repository: ${response.statusText}`, response.status);
    }
  },

  async getFileContent(owner: string, repo: string, path: string): Promise<FileContent> {
    const headers = await this.getHeaders();
    const response = await fetch(`${config.githubApi.baseUrl}/repos/${owner}/${repo}/contents/${path}`, {
      headers,
    });

    if (!response.ok) {
      throw new GitHubApiError(`Failed to get file content: ${response.statusText}`, response.status);
    }

    return response.json();
  },

  async uploadFile(owner: string, repo: string, params: UploadFileParams): Promise<any> {
    const headers = await this.getHeaders();
    
    // Convert file content to base64 if it's not already
    const base64Content = btoa(unescape(encodeURIComponent(params.content)));
    
    const body = {
      message: params.message,
      content: base64Content,
      ...(params.sha && { sha: params.sha }),
    };

    const response = await fetch(`${config.githubApi.baseUrl}/repos/${owner}/${repo}/contents/${params.path}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new GitHubApiError(
        errorData.message || `Failed to upload file: ${response.statusText}`, 
        response.status
      );
    }

    return response.json();
  },

  async deleteFile(owner: string, repo: string, path: string, sha: string, message: string): Promise<any> {
    const headers = await this.getHeaders();
    const response = await fetch(`${config.githubApi.baseUrl}/repos/${owner}/${repo}/contents/${path}`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({
        message,
        sha,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new GitHubApiError(
        errorData.message || `Failed to delete file: ${response.statusText}`, 
        response.status
      );
    }

    return response.json();
  },

  async getRepositoryContents(owner: string, repo: string, path: string = ''): Promise<any[]> {
    const headers = await this.getHeaders();
    const response = await fetch(`${config.githubApi.baseUrl}/repos/${owner}/${repo}/contents/${path}`, {
      headers,
    });

    if (!response.ok) {
      throw new GitHubApiError(`Failed to get repository contents: ${response.statusText}`, response.status);
    }

    return response.json();
  },

  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${config.githubApi.baseUrl}/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      
      return response.ok;
    } catch {
      return false;
    }
  },

  async getCurrentUser(): Promise<any> {
    const headers = await this.getHeaders();
    const response = await fetch(`${config.githubApi.baseUrl}/user`, {
      headers,
    });

    if (!response.ok) {
      throw new GitHubApiError(`Failed to get current user: ${response.statusText}`, response.status);
    }

    return response.json();
  },
};