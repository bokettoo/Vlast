import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface ChartComponentProps {
  languageStats: Array<{ name: string; value: number }>;
  totalStats: {
    totalRepos: number;
    totalStars: number;
    totalForks: number;
    publicRepos: number;
    privateRepos: number;
  };
}

const COLORS = ['#8B5CF6', '#A855F7', '#9333EA', '#7C3AED', '#6D28D9', '#5B21B6'];

const ChartComponent: React.FC<ChartComponentProps> = ({ languageStats, totalStats }) => {
  const visibilityData = [
    { name: 'Public', value: totalStats.publicRepos, color: '#10B981' },
    { name: 'Private', value: totalStats.privateRepos, color: '#EF4444' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/90 backdrop-blur-lg border border-purple-400/30 rounded-lg p-3 shadow-xl">
          <p className="text-purple-200 font-medium">{label}</p>
          <p className="text-white">
            {`Value: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/90 backdrop-blur-lg border border-purple-400/30 rounded-lg p-3 shadow-xl">
          <p className="text-purple-200 font-medium">{payload[0].name}</p>
          <p className="text-white">
            {`Repositories: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Language Distribution Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20"
      >
        <h3 className="text-xl font-semibold text-purple-100 mb-6 text-center">
          Language Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={languageStats}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {languageStats.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Repository Visibility Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20"
      >
        <h3 className="text-xl font-semibold text-purple-100 mb-6 text-center">
          Repository Visibility
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={visibilityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="name" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              radius={[4, 4, 0, 0]}
            >
              {visibilityData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={_entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Language Usage Bar Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="lg:col-span-2 p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20"
      >
        <h3 className="text-xl font-semibold text-purple-100 mb-6 text-center">
          Programming Languages Usage
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={languageStats} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              type="number" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              stroke="#9CA3AF"
              fontSize={12}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              radius={[0, 4, 4, 0]}
            >
              {languageStats.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

export default ChartComponent;