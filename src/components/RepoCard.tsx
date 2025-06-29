import React from 'react';
import { motion } from 'framer-motion';
import { Star, GitFork, Eye, Calendar, Lock, Unlock, Trash2 } from 'lucide-react';
import { Repository } from '../data/fakeRepos';

interface RepoCardProps {
  repository: Repository;
  onToggleVisibility: (repo: Repository) => void;
  onDelete: (repo: Repository) => void;
  onClick: (repo: Repository) => void;
}

const RepoCard: React.FC<RepoCardProps> = ({ repository, onToggleVisibility, onDelete, onClick }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleVisibility(repository);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(repository);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(168, 85, 247, 0.2)" }}
      transition={{ duration: 0.3 }}
      onClick={() => onClick(repository)}
      className="h-full p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 hover:border-purple-400/50 cursor-pointer transition-all duration-300 group flex flex-col"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors truncate">
              {repository.name}
            </h3>
            {repository.private ? (
              <Lock className="w-4 h-4 text-red-400 flex-shrink-0" />
            ) : (
              <Unlock className="w-4 h-4 text-green-400 flex-shrink-0" />
            )}
          </div>
          <div className="h-12 overflow-hidden">
            <p className="text-sm text-purple-200 line-clamp-2">
              {repository.description || 'No description available'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center space-x-4 mb-4 text-sm text-purple-200">
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 text-yellow-400" />
          <span>{repository.stargazers_count}</span>
        </div>
        <div className="flex items-center space-x-1">
          <GitFork className="w-4 h-4 text-blue-400" />
          <span>{repository.forks_count}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Eye className="w-4 h-4 text-gray-400" />
          <span>{repository.watchers_count}</span>
        </div>
      </div>

      {/* Language and Date */}
      <div className="flex items-center justify-between mb-4">
        {repository.language && (
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: getLanguageColor(repository.language) }}
            />
            <span className="text-sm text-purple-200 truncate">{repository.language}</span>
          </div>
        )}
        <div className="flex items-center space-x-1 text-xs text-purple-300">
          <Calendar className="w-3 h-3 flex-shrink-0" />
          <span className="whitespace-nowrap">{formatDate(repository.updated_at)}</span>
        </div>
      </div>

      {/* Topics */}
      {repository.topics && repository.topics.length > 0 && (
        <div className="mb-4 flex-1">
          <div className="flex flex-wrap gap-1">
            {repository.topics.slice(0, 3).map((topic, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30 truncate"
              >
                {topic}
              </span>
            ))}
            {repository.topics.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-500/20 text-gray-300 rounded-full border border-gray-500/30">
                +{repository.topics.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions - Always at bottom */}
      <div className="flex items-center space-x-2 mt-auto pt-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleToggleVisibility}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex-1 justify-center ${
            repository.private
              ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30'
              : 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border border-yellow-500/30'
          }`}
        >
          {repository.private ? (
            <>
              <Unlock className="w-3 h-3" />
              <span>Public</span>
            </>
          ) : (
            <>
              <Lock className="w-3 h-3" />
              <span>Private</span>
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDelete}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 transition-all duration-200"
        >
          <Trash2 className="w-3 h-3" />
          <span>Delete</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default RepoCard;