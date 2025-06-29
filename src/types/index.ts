// Core GitHub API types
export interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string | null;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  hireable: boolean | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface Repository {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: GitHubUser;
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  archive_url: string;
  assignees_url: string;
  blobs_url: string;
  branches_url: string;
  collaborators_url: string;
  comments_url: string;
  commits_url: string;
  compare_url: string;
  contents_url: string;
  contributors_url: string;
  deployments_url: string;
  downloads_url: string;
  events_url: string;
  forks_url: string;
  git_commits_url: string;
  git_refs_url: string;
  git_tags_url: string;
  git_url: string;
  issue_comment_url: string;
  issue_events_url: string;
  issues_url: string;
  keys_url: string;
  labels_url: string;
  languages_url: string;
  merges_url: string;
  milestones_url: string;
  notifications_url: string;
  pulls_url: string;
  releases_url: string;
  ssh_url: string;
  stargazers_url: string;
  statuses_url: string;
  subscribers_url: string;
  subscription_url: string;
  tags_url: string;
  teams_url: string;
  trees_url: string;
  clone_url: string;
  mirror_url: string | null;
  hooks_url: string;
  svn_url: string;
  homepage: string | null;
  language: string | null;
  forks_count: number;
  stargazers_count: number;
  watchers_count: number;
  size: number;
  default_branch: string;
  open_issues_count: number;
  is_template: boolean;
  topics: string[];
  has_issues: boolean;
  has_projects: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  has_downloads: boolean;
  archived: boolean;
  disabled: boolean;
  visibility: 'public' | 'private';
  pushed_at: string;
  created_at: string;
  updated_at: string;
  permissions?: {
    admin: boolean;
    maintain: boolean;
    push: boolean;
    triage: boolean;
    pull: boolean;
  };
  allow_rebase_merge: boolean;
  template_repository: Repository | null;
  temp_clone_token: string | null;
  allow_squash_merge: boolean;
  allow_auto_merge: boolean;
  delete_branch_on_merge: boolean;
  allow_merge_commit: boolean;
  subscribers_count: number;
  network_count: number;
  license: {
    key: string;
    name: string;
    spdx_id: string;
    url: string;
    node_id: string;
  } | null;
  forks: number;
  open_issues: number;
  watchers: number;
}

export interface FileContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: 'file' | 'dir';
  content?: string;
  encoding?: string;
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

export interface CreateRepositoryRequest {
  name: string;
  description?: string;
  homepage?: string;
  private?: boolean;
  has_issues?: boolean;
  has_projects?: boolean;
  has_wiki?: boolean;
  is_template?: boolean;
  team_id?: number;
  auto_init?: boolean;
  gitignore_template?: string;
  license_template?: string;
  allow_squash_merge?: boolean;
  allow_merge_commit?: boolean;
  allow_rebase_merge?: boolean;
  allow_auto_merge?: boolean;
  delete_branch_on_merge?: boolean;
}

export interface UpdateRepositoryRequest {
  name?: string;
  description?: string;
  homepage?: string;
  private?: boolean;
  has_issues?: boolean;
  has_projects?: boolean;
  has_wiki?: boolean;
  is_template?: boolean;
  default_branch?: string;
  allow_squash_merge?: boolean;
  allow_merge_commit?: boolean;
  allow_rebase_merge?: boolean;
  allow_auto_merge?: boolean;
  delete_branch_on_merge?: boolean;
  archived?: boolean;
}

export interface UploadFileRequest {
  path: string;
  content: string;
  message: string;
  sha?: string;
  branch?: string;
  committer?: {
    name: string;
    email: string;
  };
  author?: {
    name: string;
    email: string;
  };
}

export interface DeleteFileRequest {
  path: string;
  message: string;
  sha: string;
  branch?: string;
  committer?: {
    name: string;
    email: string;
  };
  author?: {
    name: string;
    email: string;
  };
}

// Application-specific types
export interface RepositoryStats {
  totalRepos: number;
  totalStars: number;
  totalForks: number;
  totalWatchers: number;
  publicRepos: number;
  privateRepos: number;
  averageStars: number;
}

export interface LanguageStats {
  name: string;
  value: number;
  color?: string;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface GitCommands {
  clone: string;
  sshClone: string;
  addRemote: string;
  pushExisting: string;
  pullLatest: string;
  createBranch: string;
}

// Error types
export interface GitHubApiError {
  message: string;
  documentation_url?: string;
  errors?: Array<{
    resource: string;
    field: string;
    code: string;
  }>;
}

// Component prop types
export interface RepoCardProps {
  repository: Repository;
  onToggleVisibility: (repo: Repository) => void;
  onDelete: (repo: Repository) => void;
  onClick: (repo: Repository) => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface CreateRepoModalProps extends ModalProps {
  onSuccess: (repository: Repository) => void;
}

export interface RepoDetailModalProps extends ModalProps {
  repository: Repository | null;
  onToggleVisibility: (repo: Repository) => void;
  onDelete: (repo: Repository) => void;
}

export interface ConfirmDeleteModalProps extends ModalProps {
  repository: Repository | null;
  onConfirm: (repo: Repository) => Promise<void>;
}

// Hook return types
export interface UseRepositoriesReturn {
  repositories: Repository[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseUserReturn {
  user: GitHubUser | null;
  isLoading: boolean;
  error: Error | null;
}

// Form types
export interface CreateRepoFormData {
  name: string;
  description: string;
  private: boolean;
  autoInit: boolean;
}

export interface EditRepoFormData {
  name: string;
  description: string;
}

// Filter and sort types
export type VisibilityFilter = 'all' | 'public' | 'private';
export type ViewMode = 'grid' | 'list';
export type SortOption = 'updated' | 'created' | 'name' | 'stars';

// Environment configuration types
export interface Config {
  isDevelopment: boolean;
  githubApi: {
    baseUrl: string;
    tokenKey: string;
  };
  requiredScopes: readonly string[];
}

// Query keys for React Query
export const QUERY_KEYS = {
  repositories: ['repositories'] as const,
  repository: (owner: string, repo: string) => ['repository', owner, repo] as const,
  user: ['user'] as const,
  repositoryContents: (owner: string, repo: string, path?: string) => 
    ['repository-contents', owner, repo, path] as const,
} as const;

// Mutation keys for React Query
export const MUTATION_KEYS = {
  createRepository: ['create-repository'] as const,
  updateRepository: ['update-repository'] as const,
  deleteRepository: ['delete-repository'] as const,
  uploadFile: ['upload-file'] as const,
  deleteFile: ['delete-file'] as const,
  toggleVisibility: ['toggle-visibility'] as const,
} as const;