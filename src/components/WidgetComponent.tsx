import React from 'react';
import { motion } from 'framer-motion';
import { Star, GitFork, Eye, Factory as Repository, Lock, Unlock } from 'lucide-react';
import { Repository as RepoType } from '../data/fakeRepos';

interface WidgetProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
}

const Widget: React.FC<WidgetProps> = ({ title, value, icon, color, change }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 hover:border-purple-400/50 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${color} shadow-lg`}>
          {icon}
        </div>
        {change && (
          <div className={`text-sm font-medium ${
            change.type === 'increase' ? 'text-green-400' : 'text-red-400'
          }`}>
            {change.type === 'increase' ? '+' : '-'}{change.value}%
          </div>
        )}
      </div>
      
      <div>
        <div className="text-2xl font-bold text-white mb-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div className="text-purple-200 text-sm">
          {title}
        </div>
      </div>
    </motion.div>
  );
};

interface WidgetComponentProps {
  repositories: RepoType[];
}

const WidgetComponent: React.FC<WidgetComponentProps> = ({ repositories }) => {
  // Calculate real statistics from the repositories data
  const calculateStats = () => {
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

  const stats = calculateStats();

  const widgets: WidgetProps[] = [
    {
      title: 'Total Repositories',
      value: stats.totalRepos,
      icon: <Repository className="w-6 h-6 text-white" />,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Total Stars',
      value: stats.totalStars,
      icon: <Star className="w-6 h-6 text-white" />,
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      title: 'Total Forks',
      value: stats.totalForks,
      icon: <GitFork className="w-6 h-6 text-white" />,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Total Watchers',
      value: stats.totalWatchers,
      icon: <Eye className="w-6 h-6 text-white" />,
      color: 'from-pink-500 to-pink-600',
    },
    {
      title: 'Public Repositories',
      value: stats.publicRepos,
      icon: <Unlock className="w-6 h-6 text-white" />,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Private Repositories',
      value: stats.privateRepos,
      icon: <Lock className="w-6 h-6 text-white" />,
      color: 'from-red-500 to-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {widgets.map((widget, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Widget {...widget} />
        </motion.div>
      ))}
    </div>
  );
};

export default WidgetComponent;