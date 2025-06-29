import type { Repository, RepositoryStats, LanguageStats } from '@/types';

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatRepoSize = (sizeInKB: number): string => {
  if (sizeInKB < 1024) return `${sizeInKB} KB`;
  const sizeInMB = sizeInKB / 1024;
  if (sizeInMB < 1024) return `${sizeInMB.toFixed(1)} MB`;
  const sizeInGB = sizeInMB / 1024;
  return `${sizeInGB.toFixed(1)} GB`;
};

export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

export const calculateRepositoryStats = (repositories: Repository[]): RepositoryStats => {
  const totalRepos = repositories.length;
  const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repositories.reduce((sum, repo) => sum + repo.forks_count, 0);
  const totalWatchers = repositories.reduce((sum, repo) => sum + repo.watchers_count, 0);
  const publicRepos = repositories.filter(repo => !repo.private).length;
  const privateRepos = repositories.filter(repo => repo.private).length;
  const averageStars = totalRepos > 0 ? Math.round(totalStars / totalRepos) : 0;

  return {
    totalRepos,
    totalStars,
    totalForks,
    totalWatchers,
    publicRepos,
    privateRepos,
    averageStars,
  };
};

export const calculateLanguageStats = (repositories: Repository[]): LanguageStats[] => {
  const languageCounts: Record<string, number> = {};
  
  repositories.forEach(repo => {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
    }
  });
  
  return Object.entries(languageCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

export const getLanguageColor = (language: string): string => {
  const colors: Record<string, string> = {
    JavaScript: '#F7DF1E',
    TypeScript: '#3178C6',
    Python: '#3276B3',
    Java: '#ED8B00',
    'C++': '#00599C',
    Go: '#00ADD8',
    Rust: '#000000',
    Ruby: '#CC342D',
    PHP: '#777BB4',
    Swift: '#FA7343',
    Kotlin: '#7F52FF',
    Dart: '#0175C2',
    Vue: '#4FC08D',
    React: '#61DAFB',
    Angular: '#DD0031',
    HTML: '#E34F26',
    CSS: '#1572B6',
    SCSS: '#CF649A',
    Shell: '#89E051',
    Dockerfile: '#384D54',
  };
  return colors[language] || '#8B5CF6';
};

export const validateRepositoryName = (name: string): string | null => {
  if (!name.trim()) {
    return 'Repository name is required';
  }
  
  // GitHub repository name validation
  const validNameRegex = /^[a-zA-Z0-9._-]+$/;
  if (!validNameRegex.test(name)) {
    return 'Invalid repository name. Please use alphanumeric characters, hyphens, dots, and underscores only.';
  }
  
  if (name.length > 100) {
    return 'Repository name must be 100 characters or less';
  }
  
  if (name.startsWith('.') || name.startsWith('-')) {
    return 'Repository name cannot start with a dot or hyphen';
  }
  
  return null;
};

export const generateGitCommands = (repository: Repository, currentUser?: { login: string }) => {
  const username = currentUser?.login || 'your-username';
  
  return {
    clone: `git clone ${repository.clone_url}`,
    sshClone: `git clone ${repository.ssh_url}`,
    addRemote: `git remote add origin ${repository.clone_url}`,
    pushExisting: `git remote add origin ${repository.clone_url}
git branch -M ${repository.default_branch}
git push -u origin ${repository.default_branch}`,
    pullLatest: `git pull origin ${repository.default_branch}`,
    createBranch: `git checkout -b feature/new-feature
git push -u origin feature/new-feature`,
    newRepo: `echo "# ${repository.name}" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M ${repository.default_branch}
git remote add origin ${repository.clone_url}
git push -u origin ${repository.default_branch}`,
  };
};