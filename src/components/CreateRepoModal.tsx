import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, AlertCircle, Loader2, CheckCircle, Lock, Unlock, FileText } from 'lucide-react';
import { config } from '../config/environment';
import { githubApi } from '../utils/githubApi';

interface CreateRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (repository: any) => void;
}

const CreateRepoModal: React.FC<CreateRepoModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    private: false,
    autoInit: true,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [nameError, setNameError] = useState('');

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const validateRepoName = (name: string) => {
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
    
    return '';
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({ ...prev, name }));
    setNameError(validateRepoName(name));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const nameValidationError = validateRepoName(formData.name);
    if (nameValidationError) {
      setNameError(nameValidationError);
      return;
    }

    try {
      setIsCreating(true);
      setError('');
      setNameError('');

      let newRepo;
      
      if (config.isDevelopment) {
        // Mock repository creation for development
        await new Promise(resolve => setTimeout(resolve, 2000));
        newRepo = {
          id: Date.now(),
          name: formData.name,
          full_name: `user/${formData.name}`,
          description: formData.description,
          private: formData.private,
          html_url: `https://github.com/user/${formData.name}`,
          clone_url: `https://github.com/user/${formData.name}.git`,
          ssh_url: `git@github.com:user/${formData.name}.git`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          pushed_at: new Date().toISOString(),
          stargazers_count: 0,
          forks_count: 0,
          watchers_count: 0,
          language: null,
          size: 0,
          default_branch: 'main',
          open_issues_count: 0,
          topics: [],
          visibility: formData.private ? 'private' : 'public',
          archived: false,
          disabled: false,
        };
      } else {
        newRepo = await githubApi.createRepository({
          name: formData.name,
          description: formData.description,
          private: formData.private,
          auto_init: formData.autoInit,
        });
      }

      onSuccess(newRepo);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        private: false,
        autoInit: true,
      });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create repository. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setFormData({
        name: '',
        description: '',
        private: false,
        autoInit: true,
      });
      setError('');
      setNameError('');
      onClose();
    }
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
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal - Responsive height */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-2xl max-h-[95vh] bg-gray-900/95 backdrop-blur-lg border border-purple-400/30 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex-shrink-0 p-4 sm:p-6 border-b border-purple-400/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="p-2 rounded-full bg-purple-600/20">
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-white">
                    Create New Repository
                  </h2>
                </div>
                {!isCreating && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleClose}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>
                )}
              </div>
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Repository Name */}
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Repository Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="my-awesome-project"
                    disabled={isCreating}
                    className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 disabled:opacity-50 text-sm sm:text-base ${
                      nameError ? 'border-red-500/50' : 'border-white/20'
                    }`}
                  />
                  {nameError && (
                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="mt-2 text-sm text-red-400 flex items-center space-x-1"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{nameError}</span>
                    </motion.p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Description <span className="text-purple-400">(optional)</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="A brief description of your repository..."
                    disabled={isCreating}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 disabled:opacity-50 resize-none text-sm sm:text-base"
                  />
                </div>

                {/* Visibility */}
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-3">
                    Repository Visibility
                  </label>
                  <div className="space-y-2 sm:space-y-3">
                    <motion.label
                      whileHover={{ scale: 1.02 }}
                      className={`flex items-center space-x-3 p-3 sm:p-4 rounded-xl border cursor-pointer transition-all ${
                        !formData.private
                          ? 'bg-green-500/10 border-green-500/30 text-green-300'
                          : 'bg-white/5 border-white/20 text-purple-200 hover:bg-white/10'
                      }`}
                    >
                      <input
                        type="radio"
                        name="visibility"
                        checked={!formData.private}
                        onChange={() => setFormData(prev => ({ ...prev, private: false }))}
                        disabled={isCreating}
                        className="sr-only"
                      />
                      <Unlock className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-sm sm:text-base">Public</div>
                        <div className="text-xs sm:text-sm opacity-70">Anyone can see this repository</div>
                      </div>
                    </motion.label>

                    <motion.label
                      whileHover={{ scale: 1.02 }}
                      className={`flex items-center space-x-3 p-3 sm:p-4 rounded-xl border cursor-pointer transition-all ${
                        formData.private
                          ? 'bg-red-500/10 border-red-500/30 text-red-300'
                          : 'bg-white/5 border-white/20 text-purple-200 hover:bg-white/10'
                      }`}
                    >
                      <input
                        type="radio"
                        name="visibility"
                        checked={formData.private}
                        onChange={() => setFormData(prev => ({ ...prev, private: true }))}
                        disabled={isCreating}
                        className="sr-only"
                      />
                      <Lock className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-sm sm:text-base">Private</div>
                        <div className="text-xs sm:text-sm opacity-70">Only you can see this repository</div>
                      </div>
                    </motion.label>
                  </div>
                </div>

                {/* Initialize with README */}
                <div>
                  <motion.label
                    whileHover={{ scale: 1.02 }}
                    className={`flex items-center space-x-3 p-3 sm:p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.autoInit
                        ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                        : 'bg-white/5 border-white/20 text-purple-200 hover:bg-white/10'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.autoInit}
                      onChange={(e) => setFormData(prev => ({ ...prev, autoInit: e.target.checked }))}
                      disabled={isCreating}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      formData.autoInit ? 'bg-purple-600 border-purple-600' : 'border-white/30'
                    }`}>
                      {formData.autoInit && <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />}
                    </div>
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm sm:text-base">Initialize with README</div>
                      <div className="text-xs sm:text-sm opacity-70">Create a README.md file to get started</div>
                    </div>
                  </motion.label>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 sm:p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300"
                  >
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{error}</span>
                    </div>
                  </motion.div>
                )}
              </form>
            </div>

            {/* Fixed Footer Actions */}
            <div className="flex-shrink-0 p-4 sm:p-6 border-t border-purple-400/20">
              <div className="flex space-x-3">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClose}
                  disabled={isCreating}
                  className="flex-1 px-4 py-3 bg-white/10 text-white hover:bg-white/20 border border-white/20 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit(e);
                  }}
                  disabled={isCreating || !!nameError || !formData.name.trim()}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-600/50 rounded-xl font-medium transition-colors disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Repository...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Create Repository</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateRepoModal;