import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Star, GitFork, Eye, Calendar, Clock, AlertCircle, 
  Lock, Unlock, ExternalLink, Code, Tag, Archive, 
  Trash2, Edit3, Save, FileText, Upload, Folder,
  Loader2, CheckCircle, Settings, Terminal, Copy, Download,
  GitBranch
} from 'lucide-react';
import { Repository } from '../data/fakeRepos';
import { config } from '../config/environment';
import { githubApi } from '../utils/githubApi';
import FileUploader from './FileUploader';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface RepoDetailModalProps {
  repository: Repository | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleVisibility: (repo: Repository) => void;
  onDelete: (repo: Repository) => void;
}

interface FileItem {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: 'file' | 'dir';
  download_url?: string;
}

const RepoDetailModal: React.FC<RepoDetailModalProps> = ({
  repository,
  isOpen,
  onClose,
  onToggleVisibility,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'edit' | 'files' | 'git'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // File management state
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [filesError, setFilesError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Git commands state
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (repository) {
      setEditedName(repository.name);
      setEditedDescription(repository.description || '');
      setSaveError('');
      setSaveSuccess(false);
      setIsEditing(false);
      
      // Load files when switching to files tab
      if (activeTab === 'files') {
        loadRepositoryFiles();
      }
      
      // Fetch current user for Git commands
      if (activeTab === 'git') {
        fetchCurrentUser();
      }
    }
  }, [repository, activeTab]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const fetchCurrentUser = async () => {
    try {
      if (!config.isDevelopment) {
        const user = await githubApi.getCurrentUser();
        setCurrentUser(user);
      } else {
        // Mock user for development
        setCurrentUser({ login: 'your-username' });
      }
    } catch (err) {
      console.error('Failed to fetch current user:', err);
      setCurrentUser({ login: 'your-username' });
    }
  };

  const loadRepositoryFiles = async () => {
    if (!repository || config.isDevelopment) {
      // Mock files for development
      setFiles([
        { name: 'README.md', path: 'README.md', sha: 'abc123', size: 1024, type: 'file' },
        { name: 'package.json', path: 'package.json', sha: 'def456', size: 512, type: 'file' },
        { name: 'src', path: 'src', sha: 'ghi789', size: 0, type: 'dir' },
      ]);
      return;
    }

    try {
      setLoadingFiles(true);
      setFilesError('');
      const [owner, repoName] = repository.full_name.split('/');
      const contents = await githubApi.getRepositoryContents(owner, repoName);
      
      const fileItems: FileItem[] = contents.map(item => ({
        name: item.name,
        path: item.path,
        sha: item.sha,
        size: item.size || 0,
        type: item.type === 'dir' ? 'dir' : 'file',
        download_url: item.download_url,
      }));
      
      setFiles(fileItems);
    } catch (err) {
      setFilesError(err instanceof Error ? err.message : 'Failed to load repository files');
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!repository) return;

    try {
      setIsSaving(true);
      setSaveError('');
      setSaveSuccess(false);

      if (!config.isDevelopment) {
        const [owner, repoName] = repository.full_name.split('/');
        const updates: any = {};
        
        if (editedName !== repository.name) {
          updates.name = editedName;
        }
        
        if (editedDescription !== repository.description) {
          updates.description = editedDescription;
        }

        if (Object.keys(updates).length > 0) {
          await githubApi.updateRepository(owner, repoName, updates);
        }
      }

      setSaveSuccess(true);
      setIsEditing(false);
      
      // Update local repository data
      Object.assign(repository, {
        name: editedName,
        description: editedDescription,
      });

      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update repository. Please check input and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (file: File, commitMessage: string) => {
    if (!repository || config.isDevelopment) {
      // Mock upload for development
      await new Promise(resolve => setTimeout(resolve, 2000));
      const newFile: FileItem = {
        name: file.name,
        path: file.name,
        sha: 'new123',
        size: file.size,
        type: 'file',
      };
      setFiles(prev => [...prev, newFile]);
      return;
    }

    try {
      setIsUploading(true);
      const [owner, repoName] = repository.full_name.split('/');
      
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const content = reader.result as string;
          await githubApi.uploadFile(owner, repoName, {
            path: file.name,
            content,
            message: commitMessage,
          });
          
          // Reload files after successful upload
          await loadRepositoryFiles();
        } catch (err) {
          throw err;
        }
      };
      reader.readAsText(file);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to upload file. Check console for details.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileDelete = async (file: FileItem) => {
    if (!repository) return;

    const confirmDelete = window.confirm(`Are you sure you want to delete ${file.name}?`);
    if (!confirmDelete) return;

    if (config.isDevelopment) {
      // Mock delete for development
      setFiles(prev => prev.filter(f => f.path !== file.path));
      return;
    }

    try {
      const [owner, repoName] = repository.full_name.split('/');
      const commitMessage = `Delete ${file.name}`;
      
      await githubApi.deleteFile(owner, repoName, file.path, file.sha, commitMessage);
      
      // Reload files after successful deletion
      await loadRepositoryFiles();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete file. Check console for details.');
    }
  };

  const handleDeleteRepository = async (repo: Repository) => {
    await onDelete(repo);
  };

  const copyToClipboard = async (text: string, commandType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCommand(commandType);
      setTimeout(() => setCopiedCommand(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  if (!repository) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLanguageColor = (language: string) => {
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
    };
    return colors[language] || '#8B5CF6';
  };

  const formatSize = (sizeInKB: number) => {
    if (sizeInKB < 1024) return `${sizeInKB} KB`;
    const sizeInMB = sizeInKB / 1024;
    if (sizeInMB < 1024) return `${sizeInMB.toFixed(1)} MB`;
    const sizeInGB = sizeInMB / 1024;
    return `${sizeInGB.toFixed(1)} GB`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Git commands
  const gitCommands = {
    clone: `git clone ${repository.html_url.replace('https://github.com/', 'https://github.com/')}.git`,
    sshClone: `git clone git@github.com:${repository.full_name}.git`,
    addRemote: `git remote add origin ${repository.html_url.replace('https://github.com/', 'https://github.com/')}.git`,
    pushExisting: `git remote add origin ${repository.html_url.replace('https://github.com/', 'https://github.com/')}.git
git branch -M ${repository.default_branch}
git push -u origin ${repository.default_branch}`,
    pullLatest: `git pull origin ${repository.default_branch}`,
    createBranch: `git checkout -b feature/new-feature
git push -u origin feature/new-feature`,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container - Responsive height */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-6xl max-h-[95vh] bg-gray-900/95 backdrop-blur-lg border border-purple-400/30 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Fixed Header */}
            <div className="flex-shrink-0 bg-gray-900/95 backdrop-blur-lg border-b border-purple-400/20 p-4 sm:p-6 z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-white truncate">{repository.name}</h2>
                    {repository.private ? (
                      <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0" />
                    ) : (
                      <Unlock className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                    )}
                    {repository.archived && (
                      <Archive className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-purple-200 text-sm sm:text-lg line-clamp-2">
                    {repository.description || 'No description available'}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </motion.button>
              </div>

              {/* Tabs - Responsive */}
              <div className="flex space-x-1 mt-4 sm:mt-6 bg-white/5 rounded-xl p-1 overflow-x-auto">
                {[
                  { id: 'details', label: 'Details', icon: <Eye className="w-3 h-3 sm:w-4 sm:h-4" /> },
                  { id: 'edit', label: 'Edit', icon: <Settings className="w-3 h-3 sm:w-4 sm:h-4" /> },
                  { id: 'files', label: 'Files', icon: <FileText className="w-3 h-3 sm:w-4 sm:h-4" /> },
                  { id: 'git', label: 'Git', icon: <Terminal className="w-3 h-3 sm:w-4 sm:h-4" /> },
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm ${
                      activeTab === tab.id
                        ? 'bg-purple-600 text-white'
                        : 'text-purple-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 sm:p-6">
                {/* Details Tab */}
                {activeTab === 'details' && (
                  <div className="space-y-6 sm:space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      <div className="p-3 sm:p-4 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 text-center">
                        <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 mx-auto mb-2" />
                        <div className="text-lg sm:text-2xl font-bold text-white">{repository.stargazers_count}</div>
                        <div className="text-xs sm:text-sm text-purple-200">Stars</div>
                      </div>
                      <div className="p-3 sm:p-4 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 text-center">
                        <GitFork className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 mx-auto mb-2" />
                        <div className="text-lg sm:text-2xl font-bold text-white">{repository.forks_count}</div>
                        <div className="text-xs sm:text-sm text-purple-200">Forks</div>
                      </div>
                      <div className="p-3 sm:p-4 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 text-center">
                        <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 mx-auto mb-2" />
                        <div className="text-lg sm:text-2xl font-bold text-white">{repository.watchers_count}</div>
                        <div className="text-xs sm:text-sm text-purple-200">Watchers</div>
                      </div>
                      <div className="p-3 sm:p-4 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 text-center">
                        <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400 mx-auto mb-2" />
                        <div className="text-lg sm:text-2xl font-bold text-white">{repository.open_issues_count}</div>
                        <div className="text-xs sm:text-sm text-purple-200">Issues</div>
                      </div>
                    </div>

                    {/* Repository Information */}
                    <div className="grid lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg sm:text-xl font-semibold text-purple-100 mb-4">Repository Details</h3>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                            <span className="text-purple-200 text-sm">Full Name</span>
                            <span className="text-white font-medium truncate ml-2 text-sm">{repository.full_name}</span>
                          </div>
                          
                          {repository.language && (
                            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                              <span className="text-purple-200 text-sm">Primary Language</span>
                              <div className="flex items-center space-x-2">
                                <div 
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: getLanguageColor(repository.language) }}
                                />
                                <span className="text-white font-medium text-sm">{repository.language}</span>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                            <span className="text-purple-200 text-sm">Default Branch</span>
                            <span className="text-white font-medium text-sm">{repository.default_branch}</span>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                            <span className="text-purple-200 text-sm">Repository Size</span>
                            <span className="text-white font-medium text-sm">{formatSize(repository.size)}</span>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                            <span className="text-purple-200 text-sm">Visibility</span>
                            <span className={`font-medium text-sm ${repository.private ? 'text-red-400' : 'text-green-400'}`}>
                              {repository.private ? 'Private' : 'Public'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg sm:text-xl font-semibold text-purple-100 mb-4">Timeline</h3>
                        
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3 p-3 rounded-lg bg-white/5">
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm text-purple-200">Created</div>
                              <div className="text-white font-medium text-sm">{formatDate(repository.created_at)}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-start space-x-3 p-3 rounded-lg bg-white/5">
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm text-purple-200">Last Updated</div>
                              <div className="text-white font-medium text-sm">{formatDate(repository.updated_at)}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-start space-x-3 p-3 rounded-lg bg-white/5">
                            <Code className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm text-purple-200">Last Push</div>
                              <div className="text-white font-medium text-sm">{formatDate(repository.pushed_at)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Topics */}
                    {repository.topics && repository.topics.length > 0 && (
                      <div>
                        <h3 className="text-lg sm:text-xl font-semibold text-purple-100 mb-4 flex items-center">
                          <Tag className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          Topics
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {repository.topics.map((topic, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 text-xs sm:text-sm bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Edit Tab */}
                {activeTab === 'edit' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg sm:text-xl font-semibold text-purple-100">Edit Repository</h3>
                      {saveSuccess && (
                        <div className="flex items-center space-x-2 text-green-400">
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="text-xs sm:text-sm">Changes saved successfully!</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-purple-200 mb-2">
                          Repository Name
                        </label>
                        <input
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          disabled={isSaving}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 disabled:opacity-50 text-sm sm:text-base"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-purple-200 mb-2">
                          Description
                        </label>
                        <textarea
                          value={editedDescription}
                          onChange={(e) => setEditedDescription(e.target.value)}
                          disabled={isSaving}
                          rows={4}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 disabled:opacity-50 resize-none text-sm sm:text-base"
                          placeholder="Add a description for your repository..."
                        />
                      </div>

                      {saveError && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm"
                        >
                          {saveError}
                        </motion.div>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSaveChanges}
                        disabled={isSaving || (editedName === repository.name && editedDescription === repository.description)}
                        className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-600/50 rounded-xl font-medium transition-colors disabled:cursor-not-allowed text-sm sm:text-base"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Saving Changes...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Save Changes</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* Files Tab */}
                {activeTab === 'files' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg sm:text-xl font-semibold text-purple-100">File Management</h3>
                    </div>

                    {/* File Upload Section */}
                    <div className="p-4 sm:p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10">
                      <h4 className="text-base sm:text-lg font-medium text-purple-100 mb-4">Upload New File</h4>
                      <FileUploader
                        onUpload={handleFileUpload}
                        isUploading={isUploading}
                      />
                    </div>

                    {/* Files List */}
                    <div className="p-4 sm:p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10">
                      <h4 className="text-base sm:text-lg font-medium text-purple-100 mb-4">Repository Files</h4>
                      
                      {loadingFiles ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 text-purple-400 animate-spin mr-3" />
                          <span className="text-purple-200 text-sm">Loading files...</span>
                        </div>
                      ) : filesError ? (
                        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                          {filesError}
                        </div>
                      ) : files.length === 0 ? (
                        <div className="text-center py-8 text-purple-200 text-sm">
                          No files found in this repository
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
                          {files.map((file) => (
                            <div
                              key={file.path}
                              className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            >
                              <div className="flex items-center space-x-3 min-w-0 flex-1">
                                {file.type === 'dir' ? (
                                  <Folder className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
                                ) : (
                                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0" />
                                )}
                                <div className="min-w-0">
                                  <div className="text-white font-medium truncate text-sm">{file.name}</div>
                                  {file.type === 'file' && (
                                    <div className="text-xs text-purple-200">{formatFileSize(file.size)}</div>
                                  )}
                                </div>
                              </div>
                              
                              {file.type === 'file' && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleFileDelete(file)}
                                  className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex-shrink-0"
                                >
                                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                </motion.button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Git Tab */}
                {activeTab === 'git' && (
                  <div className="space-y-6 sm:space-y-8">
                    <div className="text-center">
                      <h3 className="text-lg sm:text-xl font-semibold text-purple-100 mb-2">Git Commands</h3>
                      <p className="text-purple-200/70 font-light text-sm">
                        Use these commands to work with your repository locally
                      </p>
                    </div>

                    {/* Clone Repository */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Download className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                        <h4 className="text-base sm:text-lg font-medium text-purple-100">Clone Repository</h4>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="relative">
                          <div className="text-xs sm:text-sm text-purple-200 mb-2">HTTPS</div>
                          <pre className="bg-gray-900/50 border border-white/10 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-green-400 font-mono overflow-x-auto">
                            <code>{gitCommands.clone}</code>
                          </pre>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => copyToClipboard(gitCommands.clone, 'clone-https')}
                            className="absolute top-6 sm:top-8 right-2 sm:right-3 p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                          >
                            {copiedCommand === 'clone-https' ? (
                              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                            ) : (
                              <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                            )}
                          </motion.button>
                        </div>
                        <div className="relative">
                          <div className="text-xs sm:text-sm text-purple-200 mb-2">SSH</div>
                          <pre className="bg-gray-900/50 border border-white/10 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-green-400 font-mono overflow-x-auto">
                            <code>{gitCommands.sshClone}</code>
                          </pre>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => copyToClipboard(gitCommands.sshClone, 'clone-ssh')}
                            className="absolute top-6 sm:top-8 right-2 sm:right-3 p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                          >
                            {copiedCommand === 'clone-ssh' ? (
                              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                            ) : (
                              <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {/* Push Existing Repository */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Code className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                        <h4 className="text-base sm:text-lg font-medium text-purple-100">Push Existing Repository</h4>
                      </div>
                      <div className="relative">
                        <pre className="bg-gray-900/50 border border-white/10 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-green-400 font-mono overflow-x-auto">
                          <code>{gitCommands.pushExisting}</code>
                        </pre>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => copyToClipboard(gitCommands.pushExisting, 'push-existing')}
                          className="absolute top-2 sm:top-3 right-2 sm:right-3 p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                        >
                          {copiedCommand === 'push-existing' ? (
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                          )}
                        </motion.button>
                      </div>
                    </div>

                    {/* Common Git Operations */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <GitBranch className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                        <h4 className="text-base sm:text-lg font-medium text-purple-100">Common Operations</h4>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="relative">
                          <div className="text-xs sm:text-sm text-purple-200 mb-2">Pull Latest Changes</div>
                          <pre className="bg-gray-900/50 border border-white/10 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-green-400 font-mono overflow-x-auto">
                            <code>{gitCommands.pullLatest}</code>
                          </pre>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => copyToClipboard(gitCommands.pullLatest, 'pull-latest')}
                            className="absolute top-6 sm:top-8 right-2 sm:right-3 p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                          >
                            {copiedCommand === 'pull-latest' ? (
                              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                            ) : (
                              <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                            )}
                          </motion.button>
                        </div>
                        <div className="relative">
                          <div className="text-xs sm:text-sm text-purple-200 mb-2">Create New Branch</div>
                          <pre className="bg-gray-900/50 border border-white/10 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-green-400 font-mono overflow-x-auto">
                            <code>{gitCommands.createBranch}</code>
                          </pre>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => copyToClipboard(gitCommands.createBranch, 'create-branch')}
                            className="absolute top-6 sm:top-8 right-2 sm:right-3 p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                          >
                            {copiedCommand === 'create-branch' ? (
                              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                            ) : (
                              <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {/* Git Tips */}
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <h5 className="text-blue-300 font-medium mb-2 text-sm sm:text-base">💡 Git Tips</h5>
                      <ul className="text-xs sm:text-sm text-blue-200/80 space-y-1">
                        <li>• Always pull before pushing to avoid conflicts</li>
                        <li>• Use descriptive commit messages</li>
                        <li>• Create feature branches for new development</li>
                        <li>• Use SSH keys for easier authentication</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fixed Footer Actions - Responsive */}
            <div className="flex-shrink-0 bg-gray-900/95 backdrop-blur-lg border-t border-purple-400/20 p-4 sm:p-6">
              <div className="flex flex-wrap gap-2 sm:gap-4">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={repository.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>View on GitHub</span>
                </motion.a>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onToggleVisibility(repository)}
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                    repository.private
                      ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30'
                      : 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border border-yellow-500/30'
                  }`}
                >
                  {repository.private ? (
                    <>
                      <Unlock className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Make Public</span>
                      <span className="sm:hidden">Public</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Make Private</span>
                      <span className="sm:hidden">Private</span>
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 rounded-lg font-medium transition-colors text-sm"
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Delete Repository</span>
                  <span className="sm:hidden">Delete</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Delete Confirmation Modal */}
          <ConfirmDeleteModal
            repository={repository}
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={handleDeleteRepository}
          />
        </div>
      )}
    </AnimatePresence>
  );
};

export default RepoDetailModal;