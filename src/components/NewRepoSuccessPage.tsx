import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, Copy, Upload, Terminal, ArrowLeft, 
  ExternalLink, FileText, Code, GitBranch, Download
} from 'lucide-react';
import { config } from '../config/environment';
import { githubApi } from '../utils/githubApi';
import FileUploader from './FileUploader';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  language: string | null;
  size: number;
  default_branch: string;
  open_issues_count: number;
  topics: string[];
  visibility: 'public' | 'private';
  archived: boolean;
  disabled: boolean;
}

const NewRepoSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [repository, setRepository] = useState<Repository | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'git'>('upload');
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Get repository from navigation state
    const repo = location.state?.repository;
    if (!repo) {
      navigate('/dashboard');
      return;
    }
    setRepository(repo);
  }, [location.state, navigate]);

  const handleFileUpload = async (file: File, commitMessage: string) => {
    if (!repository) return;

    try {
      setIsUploading(true);
      
      if (config.isDevelopment) {
        // Mock upload for development
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        const [owner, repoName] = repository.full_name.split('/');
        if (!owner || !repoName) {
          throw new Error('Invalid repository name format');
        }
        
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const content = reader.result as string;
            await githubApi.uploadFile(owner, repoName, {
              path: file.name,
              content,
              message: commitMessage,
            });
          } catch (err) {
            throw err;
          }
        };
        reader.readAsText(file);
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
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

  if (!repository) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="relative z-10 text-center">
          <h2 className="text-2xl font-light text-purple-100 mb-4">Repository not found</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            Return to Dashboard
          </motion.button>
        </div>
      </div>
    );
  }

  const gitCommands = {
    newRepo: `echo "# ${repository.name}" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M ${repository.default_branch}
git remote add origin ${repository.clone_url}
git push -u origin ${repository.default_branch}`,
    
    existingRepo: `git remote add origin ${repository.clone_url}
git branch -M ${repository.default_branch}
git push -u origin ${repository.default_branch}`,
    
    clone: `git clone ${repository.clone_url}`,
    
    sshClone: `git clone ${repository.ssh_url}`
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-purple-300 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-4xl font-thin mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Repository Created Successfully!
            </h1>
            <p className="text-xl text-purple-200/80 font-light mb-2">
              {repository.name}
            </p>
            <p className="text-purple-300/60 font-light">
              {repository.description || 'Your new repository is ready to use'}
            </p>
          </motion.div>
        </div>

        {/* Repository Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-purple-100 mb-3">Repository Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-purple-200">Name:</span>
                    <span className="text-white font-medium">{repository.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Visibility:</span>
                    <span className={`font-medium ${repository.private ? 'text-red-400' : 'text-green-400'}`}>
                      {repository.private ? 'Private' : 'Public'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-200">Default Branch:</span>
                    <span className="text-white font-medium">{repository.default_branch}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-purple-100 mb-3">Quick Links</h3>
                <div className="space-y-2">
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    href={repository.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm"
                  >
                    <ExternalLink className="w-4 h-4 text-purple-400" />
                    <span>View on GitHub</span>
                  </motion.a>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => copyToClipboard(repository.clone_url, 'clone-url')}
                    className="flex items-center justify-between w-full p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <Download className="w-4 h-4 text-purple-400" />
                      <span>Clone URL</span>
                    </div>
                    {copiedCommand === 'clone-url' ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-purple-400" />
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-white/5 rounded-xl p-1">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('upload')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all flex-1 justify-center ${
                activeTab === 'upload'
                  ? 'bg-purple-600 text-white'
                  : 'text-purple-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Upload className="w-5 h-5" />
              <span>Upload Files</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('git')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all flex-1 justify-center ${
                activeTab === 'git'
                  ? 'bg-purple-600 text-white'
                  : 'text-purple-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Terminal className="w-5 h-5" />
              <span>Git Commands</span>
            </motion.button>
          </div>

          {/* Tab Content */}
          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20">
            {activeTab === 'upload' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-purple-100 mb-2">Upload Files Directly</h3>
                  <p className="text-purple-200/70 font-light">
                    Drag and drop files or click to browse and upload them directly to your repository
                  </p>
                </div>
                <FileUploader
                  onUpload={handleFileUpload}
                  isUploading={isUploading}
                />
              </div>
            )}

            {activeTab === 'git' && (
              <div className="space-y-8">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-purple-100 mb-2">Git Setup Commands</h3>
                  <p className="text-purple-200/70 font-light">
                    Use these commands to set up your local repository and push your code
                  </p>
                </div>

                {/* Create a new repository on command line */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <GitBranch className="w-5 h-5 text-purple-400" />
                    <h4 className="text-lg font-medium text-purple-100">Create a new repository on the command line</h4>
                  </div>
                  <div className="relative">
                    <pre className="bg-gray-900/50 border border-white/10 rounded-lg p-4 text-sm text-green-400 font-mono overflow-x-auto">
                      <code>{gitCommands.newRepo}</code>
                    </pre>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyToClipboard(gitCommands.newRepo, 'new-repo')}
                      className="absolute top-3 right-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      {copiedCommand === 'new-repo' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-purple-400" />
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Push existing repository */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Code className="w-5 h-5 text-purple-400" />
                    <h4 className="text-lg font-medium text-purple-100">Push an existing repository from the command line</h4>
                  </div>
                  <div className="relative">
                    <pre className="bg-gray-900/50 border border-white/10 rounded-lg p-4 text-sm text-green-400 font-mono overflow-x-auto">
                      <code>{gitCommands.existingRepo}</code>
                    </pre>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyToClipboard(gitCommands.existingRepo, 'existing-repo')}
                      className="absolute top-3 right-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      {copiedCommand === 'existing-repo' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-purple-400" />
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Clone repository */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Download className="w-5 h-5 text-purple-400" />
                    <h4 className="text-lg font-medium text-purple-100">Clone this repository</h4>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="relative">
                      <div className="text-sm text-purple-200 mb-2">HTTPS</div>
                      <pre className="bg-gray-900/50 border border-white/10 rounded-lg p-4 text-sm text-green-400 font-mono overflow-x-auto">
                        <code>{gitCommands.clone}</code>
                      </pre>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => copyToClipboard(gitCommands.clone, 'clone-https')}
                        className="absolute top-8 right-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        {copiedCommand === 'clone-https' ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-purple-400" />
                        )}
                      </motion.button>
                    </div>
                    <div className="relative">
                      <div className="text-sm text-purple-200 mb-2">SSH</div>
                      <pre className="bg-gray-900/50 border border-white/10 rounded-lg p-4 text-sm text-green-400 font-mono overflow-x-auto">
                        <code>{gitCommands.sshClone}</code>
                      </pre>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => copyToClipboard(gitCommands.sshClone, 'clone-ssh')}
                        className="absolute top-8 right-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        {copiedCommand === 'clone-ssh' ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-purple-400" />
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Additional Git Tips */}
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h5 className="text-blue-300 font-medium mb-2">💡 Git Tips</h5>
                  <ul className="text-sm text-blue-200/80 space-y-1">
                    <li>• Make sure you have Git installed on your system</li>
                    <li>• Configure your Git username and email if you haven't already</li>
                    <li>• Use SSH keys for easier authentication (recommended)</li>
                    <li>• Always pull before pushing if working with collaborators</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Footer Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-4xl mx-auto mt-8 text-center"
        >
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10">
            <h3 className="text-lg font-medium text-purple-100 mb-4">What's Next?</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="p-4 rounded-lg bg-white/5">
                <FileText className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="font-medium text-white mb-1">Add Documentation</div>
                <div className="text-purple-200/70">Create a comprehensive README and documentation</div>
              </div>
              <div className="p-4 rounded-lg bg-white/5">
                <GitBranch className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="font-medium text-white mb-1">Set Up Branches</div>
                <div className="text-purple-200/70">Create development and feature branches</div>
              </div>
              <div className="p-4 rounded-lg bg-white/5">
                <Code className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="font-medium text-white mb-1">Start Coding</div>
                <div className="text-purple-200/70">Begin developing your amazing project</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NewRepoSuccessPage;