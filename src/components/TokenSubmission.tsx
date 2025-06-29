import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Key, Shield, ArrowRight, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Background3D from '@/components/Background3D';

const TokenSubmission: React.FC = () => {
  const [token, setToken] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Please enter your GitHub Personal Access Token');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const isValid = await login(token);
      if (!isValid) {
        throw new Error('Invalid token or insufficient permissions');
      }

      setSuccess(true);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate token');
    } finally {
      setIsValidating(false);
    }
  };

  const requiredScopes = [
    { scope: 'repo', description: 'Full control of private repositories' },
    { scope: 'delete_repo', description: 'Delete repositories' },
    { scope: 'user', description: 'Read user profile data' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Background3D />
      
      <div className="relative z-10 container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
              <h1 className="text-4xl md:text-6xl font-thin mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                VLAST
              </h1>
              <p className="text-lg text-purple-200/80 font-light">
                Secure Access Setup
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="inline-block p-4 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 mb-6"
            >
              <Key className="w-8 h-8 text-purple-400" />
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-purple-200/70 font-light max-w-lg mx-auto"
            >
              Connect your GitHub account to unlock the full potential of VLAST repository management
            </motion.p>
          </div>

          {/* Token Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="p-8 rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 mb-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="token" className="block text-sm font-light text-purple-200/80 mb-3">
                  GitHub Personal Access Token
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-purple-300/50 focus:outline-none focus:ring-1 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 font-light"
                    disabled={isValidating}
                  />
                  <Shield className="absolute right-3 top-3 w-5 h-5 text-purple-400/50" />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-2 text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20"
                >
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-light">{error}</span>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-2 text-green-400 bg-green-400/10 p-3 rounded-lg border border-green-400/20"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-light">Token validated successfully! Redirecting to dashboard...</span>
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={isValidating || success}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 py-3 bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 hover:border-purple-400/50 rounded-xl font-light text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isValidating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : success ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <>
                    <span>Submit Token</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10"
          >
            <h3 className="text-xl font-light mb-4 text-purple-100 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              How to Generate Your Token
            </h3>
            
            <div className="space-y-4 text-sm text-purple-200/70 font-light">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-purple-600/50 flex items-center justify-center text-xs font-medium mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-medium text-purple-200">Go to GitHub Settings</p>
                  <p className="text-purple-300/60">Navigate to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-purple-600/50 flex items-center justify-center text-xs font-medium mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-medium text-purple-200">Generate New Token</p>
                  <p className="text-purple-300/60">Click "Generate new token (classic)" and set an expiration date</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-purple-600/50 flex items-center justify-center text-xs font-medium mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-medium text-purple-200">Select Required Scopes</p>
                  <div className="mt-2 space-y-1">
                    {requiredScopes.map((scope, index) => (
                      <div key={index} className="flex items-center space-x-2 text-xs">
                        <div className="w-2 h-2 bg-purple-400/50 rounded-full"></div>
                        <code className="bg-purple-900/30 px-2 py-1 rounded font-mono">{scope.scope}</code>
                        <span className="text-purple-300/60">- {scope.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
              <div className="flex items-start space-x-2">
                <Shield className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div className="text-sm font-light">
                  <p className="font-medium text-yellow-200">Privacy Notice</p>
                  <p className="text-yellow-300/80 mt-1">
                    Your token is stored locally in your browser and never transmitted to our servers. 
                    You can revoke it anytime from your GitHub settings.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors font-light"
              >
                <span>Open GitHub Token Settings</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default TokenSubmission;