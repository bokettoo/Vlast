import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Zap, BarChart3, Github } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Management",
      description: "Your tokens are stored locally and never transmitted to external servers. Complete privacy guaranteed."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Toggle visibility, delete repositories, and perform bulk operations with instant feedback."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Analytics Dashboard",
      description: "Visualize your coding patterns, language distribution, and repository statistics."
    },
    {
      icon: <Github className="w-8 h-8" />,
      title: "GitHub Integration",
      description: "Seamless integration with GitHub API for real-time repository management."
    }
  ];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Hero Section - Full Viewport Height */}
      <div className="relative z-10 h-screen flex items-center justify-center">
        <div className="text-center px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="space-y-12"
          >
            {/* Main Title */}
            <div className="space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-6xl md:text-8xl lg:text-9xl font-thin tracking-tight"
              >
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
                  VLAST
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl md:text-2xl text-purple-200/80 font-light max-w-2xl mx-auto"
              >
                GitHub Repository Management
              </motion.p>
            </div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const token = getToken();
                  if (token) {
                    navigate('/dashboard');
                  } else {
                    navigate('/token');
                  }
                }}
                className="group inline-flex items-center space-x-3 px-8 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full text-lg font-light hover:bg-white/20 hover:border-purple-400/50 transition-all duration-300"
              >
                <span>Get Started</span>
                <motion.div
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* About Section */}
      <div className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-thin mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              About VLAST
            </h2>
            <p className="text-lg md:text-xl text-purple-200/80 font-light max-w-3xl mx-auto leading-relaxed">
              VLAST is a sophisticated GitHub repository management interface designed for developers who demand 
              efficiency, security, and elegant design in their workflow tools. Take complete control of your 
              repositories with powerful batch operations and real-time analytics.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-purple-400/30 transition-all duration-300"
              >
                <div className="text-purple-400 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-light mb-3 text-purple-100 text-center">
                  {feature.title}
                </h3>
                <p className="text-purple-200/70 text-sm leading-relaxed text-center font-light">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="mb-6">
              <h3 className="text-2xl font-thin bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                VLAST
              </h3>
              <p className="text-purple-200/60 font-light">
                Ultimate Repository Dominion
              </p>
            </div>
            
            <div className="flex justify-center space-x-8 mb-8">
              <motion.a
                whileHover={{ scale: 1.1, color: "#A855F7" }}
                href="https://github.com/bokettoo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-300 hover:text-purple-400 transition-colors"
              >
                <Github className="w-6 h-6" />
              </motion.a>
            </div>
            
            <div className="text-sm text-purple-200/50 font-light">
              <p>&copy; 2025 VLAST. All rights reserved.</p>
              <p className="mt-2">Built with precision for developers who demand excellence.</p>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;