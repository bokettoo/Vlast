import React, { useState, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogOut, Search, RefreshCw, Grid3X3, List, User, Plus } from 'lucide-react';
import { useRepositories, useToggleRepositoryVisibility, useDeleteRepository } from '@/hooks/useRepositories';
import { useAuth } from '@/hooks/useAuth';
import { calculateRepositoryStats } from '@/utils/formatters';
import Background3D from '@/components/Background3D';
import RepoCard from '@/components/RepoCard';
import RepoDetailModal from '@/components/RepoDetailModal';
import WidgetComponent from '@/components/WidgetComponent';
import UserProfileChart from '@/components/UserProfileChart';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import CreateRepoModal from '@/components/CreateRepoModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { Repository, VisibilityFilter, ViewMode } from '@/types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  // Data fetching
  const { data: repositories = [], isLoading, error, refetch, isRefetching } = useRepositories();
  
  // Mutations
  const toggleVisibilityMutation = useToggleRepositoryVisibility();
  const deleteRepositoryMutation = useDeleteRepository();
  
  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showProfile, setShowProfile] = useState(false);
  
  // Delete confirmation state
  const [repoToDelete, setRepoToDelete] = useState<Repository | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Create repository state
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Ref for debouncing refresh
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized calculations
  const uniqueLanguages = useMemo(() => {
    return Array.from(new Set(repositories.map(repo => repo.language).filter((lang): lang is string => lang !== null)));
  }, [repositories]);

  const realTimeStats = useMemo(() => {
    return calculateRepositoryStats(repositories);
  }, [repositories]);

  const filteredRepos = useMemo(() => {
    let filtered = repositories;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(repo =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      );
    }

    // Apply visibility filter
    if (visibilityFilter !== 'all') {
      filtered = filtered.filter(repo =>
        visibilityFilter === 'private' ? repo.private : !repo.private
      );
    }

    // Apply language filter
    if (languageFilter !== 'all') {
      filtered = filtered.filter(repo => repo.language === languageFilter);
    }

    return filtered;
  }, [repositories, searchQuery, visibilityFilter, languageFilter]);

  // Enhanced refresh handler with debouncing
  const handleRefresh = useCallback(async () => {
    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // If already refreshing, don't trigger another refresh
    if (isRefetching) {
      return;
    }

    try {
      console.log('Refreshing repository data...');
      await refetch();
      console.log('Repository data refreshed successfully');
    } catch (err) {
      console.error('Failed to refresh repository data:', err);
    }
  }, [refetch, isRefetching]);

  // Debounced refresh handler for button clicks
  const handleRefreshClick = useCallback(() => {
    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Set a small delay to prevent rapid clicking
    refreshTimeoutRef.current = setTimeout(() => {
      handleRefresh();
    }, 100);
  }, [handleRefresh]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  // Event handlers
  const handleToggleVisibility = useCallback(async (repo: Repository) => {
    try {
      const [owner, repoName] = repo.full_name.split('/');
      if (!owner || !repoName) {
        throw new Error('Invalid repository name format');
      }
      await toggleVisibilityMutation.mutateAsync({
        owner: owner!,
        repo: repoName!,
        makePrivate: !repo.private,
      });
      
      console.log(`Repository visibility changed: ${repo.name} is now ${!repo.private ? 'private' : 'public'}`);
      
      // Force refresh after visibility change
      await handleRefresh();
    } catch (err) {
      console.error('Failed to toggle repository visibility:', err);
    }
  }, [toggleVisibilityMutation, handleRefresh]);

  const handleDeleteRepository = useCallback(async (repo: Repository) => {
    try {
      const [owner, repoName] = repo.full_name.split('/');
      if (!owner || !repoName) {
        throw new Error('Invalid repository name format');
      }
      await deleteRepositoryMutation.mutateAsync({ owner: owner!, repo: repoName! });
      
      console.log(`Repository deleted: ${repo.name}`);
      
      // Force refresh after deletion
      await handleRefresh();
    } catch (err) {
      console.error('Failed to delete repository:', err);
      throw err; // Re-throw to be handled by the confirmation modal
    }
  }, [deleteRepositoryMutation, handleRefresh]);

  const handleDeleteClick = useCallback((repo: Repository) => {
    setRepoToDelete(repo);
    setShowDeleteConfirm(true);
  }, []);

  const handleRepoClick = useCallback((repo: Repository) => {
    setSelectedRepo(repo);
    setIsModalOpen(true);
  }, []);

  const handleCreateSuccess = useCallback((newRepository: Repository) => {
    setShowCreateModal(false);
    // Force refresh after creating new repository
    handleRefresh();
    navigate('/repo-success', { state: { repository: newRepository } });
  }, [navigate, handleRefresh]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedRepo(null);
  }, []);

  const handleCloseDeleteConfirm = useCallback(() => {
    setShowDeleteConfirm(false);
    setRepoToDelete(null);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <Background3D />
        <div className="relative z-10">
          <LoadingSpinner size="lg" text="Loading Repositories..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Background3D />
      
      <div className="relative z-10">
        {/* Header - Fixed but not overlapping */}
        <div className="border-b border-white/10 bg-gray-900/30 backdrop-blur-lg sticky top-0 z-30">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-thin bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  VLAST
                </h1>
                <p className="text-purple-200/70 text-sm font-light">
                  {repositories.length} repositories • {realTimeStats.totalStars} stars • {realTimeStats.totalForks} forks
                  {isRefetching && (
                    <span className="ml-2 text-purple-400">• Refreshing...</span>
                  )}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600/50 text-white hover:bg-purple-600 border border-purple-400/50 rounded-lg transition-colors font-light"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Repository</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowProfile(!showProfile)}
                  className={`p-2 rounded-lg transition-colors ${
                    showProfile 
                      ? 'bg-purple-600/50 text-white border border-purple-400/50' 
                      : 'bg-white/10 text-purple-300 hover:bg-white/20 border border-white/20'
                  }`}
                >
                  <User className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="p-2 rounded-lg bg-white/10 text-purple-300 hover:bg-white/20 border border-white/20 transition-colors"
                >
                  {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid3X3 className="w-5 h-5" />}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRefreshClick}
                  disabled={isRefetching}
                  className={`p-2 rounded-lg transition-colors ${
                    isRefetching 
                      ? 'bg-purple-600/50 text-white border border-purple-400/50' 
                      : 'bg-white/10 text-purple-300 hover:bg-white/20 border border-white/20'
                  }`}
                  title="Refresh repositories"
                >
                  <RefreshCw className={`w-5 h-5 ${isRefetching ? 'animate-spin' : ''}`} />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-colors font-light"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Proper spacing from fixed header */}
        <div className="container mx-auto px-6 py-8">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 font-light"
            >
              <div className="flex items-center justify-between">
                <span>{error.message}</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRefreshClick}
                  className="px-3 py-1 bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 rounded text-sm transition-colors"
                >
                  Retry
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Stats Widgets - Now using real data */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <WidgetComponent repositories={repositories} />
          </motion.div>

          {/* User Profile Chart Section */}
          {showProfile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <UserProfileChart />
            </motion.div>
          )}

          {/* Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-wrap gap-4">
              {/* Search */}
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-purple-400/50" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search repositories..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-purple-300/50 focus:outline-none focus:ring-1 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 font-light"
                  />
                </div>
              </div>

              {/* Visibility Filter */}
              <select
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value as VisibilityFilter)}
                className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 font-light"
              >
                <option value="all">All Repositories</option>
                <option value="public">Public Only</option>
                <option value="private">Private Only</option>
              </select>

              {/* Language Filter */}
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 font-light custom-scrollbar"
              >
                <option value="all">All Languages</option>
                {uniqueLanguages.map(language => (
                  <option key={language} value={language}>{language}</option>
                ))}
              </select>
            </div>

            <div className="text-sm text-purple-300/70 font-light">
              Showing {filteredRepos.length} of {repositories.length} repositories
            </div>
          </div>

          {/* Repository Grid */}
          {filteredRepos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-light text-purple-100 mb-2">No repositories found</h3>
              <p className="text-purple-300/70 font-light">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className={`grid ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            } gap-6`}>
              {filteredRepos.map((repo, index) => (
                <motion.div
                  key={repo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <RepoCard
                    repository={repo}
                    onToggleVisibility={handleToggleVisibility}
                    onDelete={handleDeleteClick}
                    onClick={handleRepoClick}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Repository Detail Modal */}
      <RepoDetailModal
        repository={selectedRepo}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onToggleVisibility={handleToggleVisibility}
        onDelete={handleDeleteClick}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        repository={repoToDelete}
        isOpen={showDeleteConfirm}
        onClose={handleCloseDeleteConfirm}
        onConfirm={handleDeleteRepository}
      />

      {/* Create Repository Modal */}
      <CreateRepoModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default React.memo(Dashboard);