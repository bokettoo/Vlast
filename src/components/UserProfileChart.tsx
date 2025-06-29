import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { User, Calendar, MapPin, Link as LinkIcon, Building, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { config } from '../config/environment';

interface UserProfile {
  login: string;
  id: number;
  name: string;
  email: string;
  bio: string;
  company: string;
  location: string;
  blog: string;
  avatar_url: string;
  html_url: string;
  followers: number;
  following: number;
  public_repos: number;
  public_gists: number;
  created_at: string;
  updated_at: string;
  type: string;
  hireable: boolean;
}

interface UserStats {
  name: string;
  value: number;
  color: string;
}

interface ApiError {
  message: string;
  status?: number;
}

const COLORS = ['#8B5CF6', '#A855F7', '#9333EA', '#7C3AED', '#6D28D9', '#5B21B6'];

const UserProfileChart: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Step 1: Authenticate using bearer token
      const token = localStorage.getItem(config.githubApi.tokenKey);
      if (!token) {
        throw new Error('No authentication token found. Please login first.');
      }

      // Step 2: Fetch user profile data from API endpoint
      const response = await fetch(`${config.githubApi.baseUrl}/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
      });

      // Handle API errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 
          `API request failed with status ${response.status}: ${response.statusText}`
        );
      }

      // Step 3: Validate the received data before processing
      const userData = await response.json();
      
      if (!userData || typeof userData !== 'object') {
        throw new Error('Invalid user profile data received from API');
      }

      // Validate required fields
      const requiredFields = ['login', 'id', 'public_repos', 'followers', 'following'];
      const missingFields = requiredFields.filter(field => userData[field] === undefined);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required user profile fields: ${missingFields.join(', ')}`);
      }

      setUserProfile(userData);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError({
        message: err instanceof Error ? err.message : 'Failed to fetch user profile data',
        status: err instanceof Error && 'status' in err ? (err as any).status : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Transform API response into chart format
  const transformDataForCharts = (profile: UserProfile) => {
    const statsData: UserStats[] = [
      {
        name: 'Public Repos',
        value: profile.public_repos,
        color: COLORS[0],
      },
      {
        name: 'Followers',
        value: profile.followers,
        color: COLORS[1],
      },
      {
        name: 'Following',
        value: profile.following,
        color: COLORS[2],
      },
      {
        name: 'Public Gists',
        value: profile.public_gists,
        color: COLORS[3],
      },
    ];

    const activityData = [
      { name: 'Repositories', value: profile.public_repos },
      { name: 'Gists', value: profile.public_gists },
    ];

    const socialData = [
      { name: 'Followers', value: profile.followers },
      { name: 'Following', value: profile.following },
    ];

    return { statsData, activityData, socialData };
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900/90 backdrop-blur-lg border border-purple-400/30 rounded-lg p-3 shadow-xl">
          <p className="text-purple-200 font-medium">{label}</p>
          <p className="text-white">
            {`Count: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Step 5: Display loading state
  if (loading) {
    return (
      <div className="p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20">
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          <span className="text-purple-200">Loading user profile data...</span>
        </div>
      </div>
    );
  }

  // Step 6: Handle and display API errors
  if (error) {
    return (
      <div className="p-8 rounded-2xl bg-red-500/10 backdrop-blur-lg border border-red-500/30">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-red-400 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-red-300 mb-2">
              Failed to Load Profile Data
            </h3>
            <p className="text-red-200 mb-4">{error.message}</p>
            {error.status && (
              <p className="text-red-300 text-sm mb-4">
                Status Code: {error.status}
              </p>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchUserProfile}
              className="px-4 py-2 bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-colors"
            >
              Retry
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // Step 7: Render chart only when valid data is available
  if (!userProfile) {
    return (
      <div className="p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20">
        <div className="text-center text-purple-200">
          No user profile data available
        </div>
      </div>
    );
  }

  const { statsData, activityData, socialData } = transformDataForCharts(userProfile);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      {/* User Profile Header */}
      <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20">
        <div className="flex items-center space-x-6">
          <img
            src={userProfile.avatar_url}
            alt={userProfile.name || userProfile.login}
            className="w-20 h-20 rounded-full border-2 border-purple-400"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">
              {userProfile.name || userProfile.login}
            </h2>
            <p className="text-purple-200 mb-2">@{userProfile.login}</p>
            {userProfile.bio && (
              <p className="text-purple-300 text-sm mb-3">{userProfile.bio}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-purple-200">
              {userProfile.company && (
                <div className="flex items-center space-x-1">
                  <Building className="w-4 h-4" />
                  <span>{userProfile.company}</span>
                </div>
              )}
              {userProfile.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{userProfile.location}</span>
                </div>
              )}
              {userProfile.email && (
                <div className="flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>{userProfile.email}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {formatDate(userProfile.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Statistics Pie Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20"
        >
          <h3 className="text-xl font-semibold text-purple-100 mb-6 text-center">
            Profile Statistics
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Activity Bar Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20"
        >
          <h3 className="text-xl font-semibold text-purple-100 mb-6 text-center">
            Content Activity
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activityData}>
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
                fill={COLORS[0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Social Network Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="lg:col-span-2 p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20"
        >
          <h3 className="text-xl font-semibold text-purple-100 mb-6 text-center">
            Social Network
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={socialData} layout="horizontal">
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
                {socialData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index + 1]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Profile Metrics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
            className="p-4 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 text-center"
          >
            <div 
              className="text-2xl font-bold mb-1"
              style={{ color: stat.color }}
            >
              {stat.value.toLocaleString()}
            </div>
            <div className="text-sm text-purple-200">{stat.name}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default UserProfileChart;