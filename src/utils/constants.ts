export const COLORS = {
  CHART: ['#8B5CF6', '#A855F7', '#9333EA', '#7C3AED', '#6D28D9', '#5B21B6'],
  LANGUAGE: {
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
  },
} as const;

export const GITHUB_SCOPES = [
  { scope: 'repo', description: 'Full control of private repositories' },
  { scope: 'delete_repo', description: 'Delete repositories' },
  { scope: 'user', description: 'Read user profile data' },
] as const;

export const FILE_SIZE_LIMITS = {
  MAX_UPLOAD_SIZE: 25 * 1024 * 1024, // 25MB
  MAX_FILE_SIZE_DISPLAY: 1024 * 1024, // 1MB
} as const;

export const CACHE_TIMES = {
  REPOSITORIES: 5 * 60 * 1000, // 5 minutes
  USER: 10 * 60 * 1000, // 10 minutes
  REPOSITORY_CONTENTS: 2 * 60 * 1000, // 2 minutes
} as const;

export const ANIMATION_DURATIONS = {
  FAST: 0.2,
  NORMAL: 0.3,
  SLOW: 0.6,
  VERY_SLOW: 1.0,
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;