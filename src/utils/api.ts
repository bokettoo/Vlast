import { config } from '@/config/environment';
import type {
  Repository,
  GitHubUser,
  FileContent,
  CreateRepositoryRequest,
  UpdateRepositoryRequest,
  UploadFileRequest,
  DeleteFileRequest,
} from '@/types';

export class GitHubApiError extends Error {
  public readonly status?: number;
  public readonly errors?: Array<{
    resource: string;
    field: string;
    code: string;
  }>;

  constructor(message: string, status?: number, errors?: Array<{
    resource: string;
    field: string;
    code: string;
  }>) {
    super(message);
    this.name = 'GitHubApiError';
    if (status !== undefined) {
      this.status = status;
    }
    if (errors !== undefined) {
      this.errors = errors;
    }
  }
}

class GitHubApi {
  private readonly baseUrl = config.githubApi.baseUrl;
  private readonly tokenKey = config.githubApi.tokenKey;

  private async getHeaders(): Promise<HeadersInit> {
    const token = localStorage.getItem(this.tokenKey);
    if (!token) {
      throw new GitHubApiError('No GitHub token found. Please submit your token first.');
    }
    
    return {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData: GitHubApiError | undefined;
      
      try {
        errorData = await response.json() as GitHubApiError;
      } catch {
        // If JSON parsing fails, use default error
      }

      throw new GitHubApiError(
        errorData?.message || `Request failed with status ${response.status}: ${response.statusText}`,
        response.status,
        errorData?.errors
      );
    }

    return response.json() as Promise<T>;
  }

  async fetchRepositories(): Promise<Repository[]> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}/user/repos?per_page=100&sort=updated`, {
      headers,
    });

    return this.handleResponse<Repository[]>(response);
  }

  async fetchRepository(owner: string, repo: string): Promise<Repository> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}`, {
      headers,
    });

    return this.handleResponse<Repository>(response);
  }

  async createRepository(params: CreateRepositoryRequest): Promise<Repository> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}/user/repos`, {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
    });

    try {
      return await this.handleResponse<Repository>(response);
    } catch (error) {
      if (error instanceof GitHubApiError && error.status === 422 && error.errors) {
        const nameError = error.errors.find(
          (err) => err.field === 'name' && err.code === 'already_exists'
        );
        if (nameError) {
          throw new GitHubApiError(
            `Repository name '${params.name}' already exists for your account. Please choose a different name.`,
            error.status
          );
        }
      }
      throw error;
    }
  }

  async updateRepository(
    owner: string,
    repo: string,
    updates: UpdateRepositoryRequest
  ): Promise<Repository> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates),
    });

    return this.handleResponse<Repository>(response);
  }

  async deleteRepository(owner: string, repo: string): Promise<void> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new GitHubApiError(`Failed to delete repository: ${response.statusText}`, response.status);
    }
  }

  async toggleRepositoryVisibility(
    owner: string,
    repo: string,
    makePrivate: boolean
  ): Promise<Repository> {
    return this.updateRepository(owner, repo, { private: makePrivate });
  }

  async getRepositoryContents(
    owner: string,
    repo: string,
    path: string = ''
  ): Promise<FileContent[]> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`, {
      headers,
    });

    return this.handleResponse<FileContent[]>(response);
  }

  async getFileContent(owner: string, repo: string, path: string): Promise<FileContent> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`, {
      headers,
    });

    return this.handleResponse<FileContent>(response);
  }

  async uploadFile(owner: string, repo: string, params: UploadFileRequest): Promise<any> {
    const headers = await this.getHeaders();
    
    // Convert file content to base64 if it's not already
    const base64Content = btoa(unescape(encodeURIComponent(params.content)));
    
    const body = {
      message: params.message,
      content: base64Content,
      ...(params.sha && { sha: params.sha }),
      ...(params.branch && { branch: params.branch }),
      ...(params.committer && { committer: params.committer }),
      ...(params.author && { author: params.author }),
    };

    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/contents/${params.path}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    return this.handleResponse<any>(response);
  }

  async deleteFile(owner: string, repo: string, params: DeleteFileRequest): Promise<any> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/contents/${params.path}`, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({
        message: params.message,
        sha: params.sha,
        ...(params.branch && { branch: params.branch }),
        ...(params.committer && { committer: params.committer }),
        ...(params.author && { author: params.author }),
      }),
    });

    return this.handleResponse<any>(response);
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      
      return response.ok;
    } catch {
      return false;
    }
  }

  async getCurrentUser(): Promise<GitHubUser> {
    const headers = await this.getHeaders();
    const response = await fetch(`${this.baseUrl}/user`, {
      headers,
    });

    return this.handleResponse<GitHubUser>(response);
  }
}

export const githubApi = new GitHubApi();