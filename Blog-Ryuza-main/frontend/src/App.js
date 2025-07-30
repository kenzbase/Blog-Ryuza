import React, { useState, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Github, ExternalLink, Sparkles, ArrowLeft, Calendar, Users, Clock, Eye, User, Wallet, Settings, LogOut, Menu, X, Mail, Lock, UserCheck, CheckCircle, AlertCircle } from "lucide-react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams, Link, Navigate } from "react-router-dom";
import axios from "axios";
import "./App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, authToken) => {
    setToken(authToken);
    setUser(userData);
    localStorage.setItem('token', authToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      updateUser,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Authentication Components
const AuthPage = ({ isDark, toggleTheme }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await axios.post(`${API}${endpoint}`, formData);
      
      login(response.data.user, response.data.access_token);
      
      if (response.data.needs_username) {
        navigate('/select-username');
      } else {
        navigate(`/${response.data.user.username}`);
      }
    } catch (error) {
      setError(error.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 
                   dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500
                   flex items-center justify-center px-6">
      
      <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.h1 
            className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 
                       bg-clip-text text-transparent mb-4"
          >
            HoverBoard
          </motion.h1>
          <p className="text-gray-600 dark:text-gray-300">
            {isLogin ? 'Masuk ke akun Anda' : 'Bergabung dengan HoverBoard'}
          </p>
        </div>

        {/* Auth Form */}
        <motion.div
          className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg 
                     border border-white/20 dark:border-gray-700/50
                     rounded-2xl p-8 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 
                         dark:border-red-700 rounded-lg flex items-center gap-2"
              >
                <AlertCircle size={16} className="text-red-600" />
                <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
              </motion.div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 
                             border border-gray-200 dark:border-gray-700 rounded-lg
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             text-gray-900 dark:text-white transition-all duration-200"
                    placeholder="Masukkan nama lengkap Anda"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 
                           border border-gray-200 dark:border-gray-700 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           text-gray-900 dark:text-white transition-all duration-200"
                  placeholder="masukkan@email.anda"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 
                           border border-gray-200 dark:border-gray-700 rounded-lg
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           text-gray-900 dark:text-white transition-all duration-200"
                  placeholder="Masukkan password Anda"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 
                       hover:from-blue-600 hover:to-purple-700 text-white font-medium 
                       rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isLogin ? 'Masuk...' : 'Mendaftar...'}</span>
                </div>
              ) : (
                <span>{isLogin ? 'Masuk' : 'Daftar'}</span>
              )}
            </motion.button>
          </form>

          {/* Toggle Auth Mode */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 
                       dark:hover:text-blue-300 font-medium transition-colors duration-200"
            >
              {isLogin ? 'Belum punya akun? Daftar disini' : 'Sudah punya akun? Masuk disini'}
            </button>
          </div>

          {/* Demo Account */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
              <strong>Demo:</strong> demo@hoverboard.com / demo123
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

// Username Selection Page
const UsernameSelectionPage = ({ isDark, toggleTheme }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API}/auth/select-username`, { username });
      updateUser(response.data.user);
      navigate(`/${username}`);
    } catch (error) {
      setError(error.response?.data?.detail || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const validateUsername = (value) => {
    const pattern = /^[a-zA-Z0-9_]{3,30}$/;
    return pattern.test(value);
  };

  const isValid = validateUsername(username);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 
                   dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500
                   flex items-center justify-center px-6">
      
      <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Welcome Message */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 
                     rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <UserCheck size={32} className="text-white" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Selamat Datang, {user?.full_name}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Pilih username unik untuk profil Anda
          </p>
        </div>

        {/* Username Form */}
        <motion.div
          className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg 
                     border border-white/20 dark:border-gray-700/50
                     rounded-2xl p-8 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 
                         dark:border-red-700 rounded-lg flex items-center gap-2"
              >
                <AlertCircle size={16} className="text-red-600" />
                <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username Anda
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  className={`w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 
                           border rounded-lg focus:ring-2 focus:border-transparent
                           text-gray-900 dark:text-white transition-all duration-200
                           ${isValid && username ? 
                             'border-green-300 focus:ring-green-500' : 
                             'border-gray-200 dark:border-gray-700 focus:ring-blue-500'}`}
                  placeholder="username_anda"
                />
                {username && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {isValid ? (
                      <CheckCircle size={20} className="text-green-500" />
                    ) : (
                      <AlertCircle size={20} className="text-red-500" />
                    )}
                  </div>
                )}
              </div>
              
              {/* URL Preview */}
              {username && isValid && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg"
                >
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Profil Anda akan tersedia di: <strong>hoverboard.com/{username}</strong>
                  </p>
                </motion.div>
              )}

              {/* Validation Rules */}
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <p>• 3-30 karakter</p>
                <p>• Hanya huruf, angka, dan underscore (_)</p>
                <p>• Tidak boleh ada spasi</p>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading || !isValid || !username}
              whileHover={{ scale: loading || !isValid ? 1 : 1.02 }}
              whileTap={{ scale: loading || !isValid ? 1 : 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 
                       hover:from-blue-600 hover:to-purple-700 text-white font-medium 
                       rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Menyimpan...</span>
                </div>
              ) : (
                <span>Konfirmasi Username</span>
              )}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};
const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    }
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
  };

  return (
    <div className={isDark ? 'dark' : ''}>
      {React.cloneElement(children, { isDark, toggleTheme })}
    </div>
  );
};

// Animated Hover Bubble Component
const HoverBubble = ({ isVisible, content, funFact, techStack, position, linkUrl }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25,
            duration: 0.3 
          }}
          className="absolute z-50 w-80 p-4 bg-white/90 dark:bg-gray-900/90 
                     backdrop-blur-md border border-white/20 dark:border-gray-700/50
                     rounded-2xl shadow-2xl"
          style={{
            left: position.x > window.innerWidth / 2 ? -320 : 20,
            top: position.y > window.innerHeight / 2 ? -200 : 20
          }}
        >
          {/* Glowing dot connector */}
          <div className="absolute -left-2 top-6 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 
                         rounded-full shadow-lg shadow-blue-500/50"></div>
          
          {/* Content */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {content}
              </p>
              {linkUrl && (
                <a 
                  href={linkUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 p-1 text-blue-500 hover:text-blue-600 transition-colors"
                >
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
            
            {/* Fun Fact */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 
                           dark:to-purple-900/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-purple-500" />
                <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Fakta Menarik</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {funFact}
              </p>
            </div>

            {/* Tech Stack */}
            {techStack && techStack.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {techStack.map((tech, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 
                             text-gray-700 dark:text-gray-300 rounded-md"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Portfolio Card Component
const PortfolioCard = ({ item, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  const handleMouseEnter = (e) => {
    setIsHovered(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({ 
      x: rect.right, 
      y: rect.top 
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleCardClick = () => {
    navigate(`/project/${item.id}`);
  };

  const categoryColors = {
    web: "from-blue-500 to-cyan-500",
    app: "from-green-500 to-emerald-500", 
    ai: "from-purple-500 to-pink-500",
    mobile: "from-orange-500 to-red-500",
    data: "from-indigo-500 to-purple-500",
    design: "from-pink-500 to-rose-500"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        whileHover={{ 
          scale: 1.02,
          rotateY: 5,
          rotateX: 5
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="relative overflow-hidden rounded-2xl bg-white/10 dark:bg-gray-900/50 
                   backdrop-blur-lg border border-white/20 dark:border-gray-700/50
                   shadow-xl group-hover:shadow-2xl transition-all duration-500
                   cursor-pointer"
        style={{ perspective: "1000px" }}
        onClick={handleCardClick}
      >
        {/* Background Image with Overlay */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={item.image_url} 
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-700 
                       group-hover:scale-110"
          />
          <div className={`absolute inset-0 bg-gradient-to-br ${categoryColors[item.category] || 'from-gray-500 to-gray-700'} 
                          opacity-80 group-hover:opacity-70 transition-opacity duration-300`}></div>
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 text-xs font-medium bg-white/90 dark:bg-gray-900/90 
                           text-gray-900 dark:text-white rounded-full backdrop-blur-sm">
              {item.category.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {item.title}
          </h3>
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-3">
            {item.subtitle}
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            {item.description}
          </p>

          {/* Action Indicators */}
          <div className="flex items-center justify-between mt-4">
            <motion.div
              animate={{ 
                x: isHovered ? 10 : 0,
                opacity: isHovered ? 1 : 0.7 
              }}
              className="flex items-center gap-2 text-xs text-purple-500"
            >
              <span>Hover untuk detail</span>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            </motion.div>
            
            <motion.div
              whileHover={{ x: 5 }}
              className="flex items-center gap-1 text-xs text-blue-500"
            >
              <span>Klik untuk lihat</span>
              <Eye size={12} />
            </motion.div>
          </div>
        </div>

        {/* Glowing Border Effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 
                       opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </motion.div>

      {/* Hover Bubble */}
      <HoverBubble
        isVisible={isHovered}
        content={item.hover_content}
        funFact={item.fun_fact}
        techStack={item.tech_stack}
        position={mousePosition}
        linkUrl={item.link_url}
      />
    </motion.div>
  );
};

// Project Detail Page Component
const ProjectDetail = ({ isDark, toggleTheme }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    fetchProjectDetail();
  }, [id]);

  const fetchProjectDetail = async () => {
    try {
      const response = await axios.get(`${API}/hover-items/${id}`);
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryColors = {
    web: "from-blue-500 to-cyan-500",
    app: "from-green-500 to-emerald-500", 
    ai: "from-purple-500 to-pink-500",
    mobile: "from-orange-500 to-red-500",
    data: "from-indigo-500 to-purple-500",
    design: "from-pink-500 to-rose-500"
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 
                     flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        ></motion.div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 
                     flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Proyek tidak ditemukan</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 
                   dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500">
      
      {/* Profile Menu */}
      <ProfileMenu isOpen={isProfileOpen} setIsOpen={setIsProfileOpen} />
      
      {/* Theme Toggle */}
      <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/')}
        className="fixed top-24 left-6 z-50 flex items-center gap-2 px-4 py-3 
                   bg-white/90 dark:bg-gray-900/90 backdrop-blur-md 
                   border border-white/20 dark:border-gray-700/50
                   rounded-full shadow-lg hover:shadow-xl transition-all duration-300
                   text-gray-900 dark:text-white"
      >
        <ArrowLeft size={20} />
        <span className="hidden sm:inline">Kembali</span>
      </motion.button>

      <div className="container mx-auto px-6 py-12 pt-24">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-8">
            <img 
              src={project.image_url} 
              alt={project.title}
              className="w-full h-96 object-cover"
            />
            <div className={`absolute inset-0 bg-gradient-to-br ${categoryColors[project.category] || 'from-gray-500 to-gray-700'} 
                            opacity-70`}></div>
            
            {/* Project Info Overlay */}
            <div className="absolute inset-0 flex items-end">
              <div className="p-8 text-white">
                <div className="mb-4">
                  <span className="px-3 py-1 text-sm font-medium bg-white/20 rounded-full backdrop-blur-sm">
                    {project.category.toUpperCase()}
                  </span>
                </div>
                <h1 className="text-5xl font-bold mb-4">{project.title}</h1>
                <p className="text-xl opacity-90 mb-6">{project.subtitle}</p>
                
                {/* Quick Stats */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{project.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span>{project.team_size} orang</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span className="capitalize">{project.status}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl p-8
                         border border-white/20 dark:border-gray-700/50 shadow-xl"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Tentang Proyek
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                {project.detailed_description}
              </p>
            </motion.section>

            {/* Features */}
            {project.features && project.features.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl p-8
                           border border-white/20 dark:border-gray-700/50 shadow-xl"
              >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  Fitur Utama
                </h2>
                <ul className="space-y-3">
                  {project.features.map((feature, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.section>
            )}

            {/* Challenges & Solutions */}
            {project.challenges && project.challenges.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* Challenges */}
                <div className="bg-red-50/70 dark:bg-red-900/20 backdrop-blur-md rounded-2xl p-6
                               border border-red-200/30 dark:border-red-800/30 shadow-xl">
                  <h3 className="text-xl font-bold text-red-800 dark:text-red-300 mb-4">
                    Tantangan
                  </h3>
                  <ul className="space-y-2">
                    {project.challenges.map((challenge, index) => (
                      <li key={index} className="text-red-700 dark:text-red-300 text-sm">
                        • {challenge}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Solutions */}
                <div className="bg-green-50/70 dark:bg-green-900/20 backdrop-blur-md rounded-2xl p-6
                               border border-green-200/30 dark:border-green-800/30 shadow-xl">
                  <h3 className="text-xl font-bold text-green-800 dark:text-green-300 mb-4">
                    Solusi
                  </h3>
                  <ul className="space-y-2">
                    {project.solutions.map((solution, index) => (
                      <li key={index} className="text-green-700 dark:text-green-300 text-sm">
                        • {solution}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.section>
            )}

            {/* Gallery */}
            {project.gallery_images && project.gallery_images.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl p-8
                           border border-white/20 dark:border-gray-700/50 shadow-xl"
              >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  Galeri Proyek
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.gallery_images.map((image, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="rounded-xl overflow-hidden shadow-lg"
                    >
                      <img 
                        src={image} 
                        alt={`${project.title} gallery ${index + 1}`}
                        className="w-full h-48 object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Tech Stack */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl p-6
                         border border-white/20 dark:border-gray-700/50 shadow-xl sticky top-24"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Teknologi
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.tech_stack.map((tech, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/50 
                             text-blue-800 dark:text-blue-300 rounded-lg"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Fun Fact */}
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 
                             dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-purple-500" />
                  <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    Fakta Menarik
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {project.fun_fact}
                </p>
              </div>

              {/* Links */}
              <div className="mt-6 space-y-3">
                {project.demo_url && (
                  <a
                    href={project.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 
                             bg-blue-500 hover:bg-blue-600 text-white rounded-lg 
                             transition-colors duration-200"
                  >
                    <ExternalLink size={16} />
                    <span>Lihat Demo</span>
                  </a>
                )}
                
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 
                             bg-gray-800 hover:bg-gray-700 text-white rounded-lg 
                             transition-colors duration-200"
                  >
                    <Github size={16} />
                    <span>Lihat Kode</span>
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Dropdown Menu Component
const ProfileMenu = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="relative">
      {/* Profile Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-50 flex items-center gap-3 px-4 py-3 
                   bg-white/90 dark:bg-gray-900/90 backdrop-blur-md 
                   border border-white/20 dark:border-gray-700/50
                   rounded-full shadow-lg hover:shadow-xl transition-all duration-300
                   text-gray-900 dark:text-white"
      >
        <img 
          src={user.avatar_url} 
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover border-2 border-blue-500"
        />
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium">{user.full_name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{user.level}</p>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <X size={16} /> : <Menu size={16} />}
        </motion.div>
      </motion.button>

      {/* Profile Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-24 left-6 z-40 w-80 
                       bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg
                       border border-white/20 dark:border-gray-700/50
                       rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Profile Header */}
            <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <div className="flex items-center gap-4">
                <img 
                  src={user.avatar_url} 
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-lg"
                />
                <div>
                  <h3 className="text-lg font-bold">{user.full_name}</h3>
                  <p className="text-blue-100">@{user.username}</p>
                  <p className="text-blue-200 text-sm">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                      {user.level}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Saldo Section */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 
                           dark:from-green-900/30 dark:to-emerald-900/30 
                           border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet size={16} className="text-green-600" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Saldo Anda
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    Rp {user.saldo.toLocaleString('id-ID')}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white 
                           rounded-lg text-sm font-medium transition-colors duration-200
                           shadow-md hover:shadow-lg"
                >
                  Top Up
                </motion.button>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              {[
                { icon: User, label: "Profil Saya", action: () => navigate(`/${user.username}`) },
                { icon: Wallet, label: "Riwayat Transaksi", badge: "3" },
                { icon: Settings, label: "Pengaturan" },
                { icon: ExternalLink, label: "Bantuan & Support" }
              ].map((item, index) => (
                <motion.button
                  key={index}
                  whileHover={{ x: 4 }}
                  onClick={item.action || (() => {})}
                  className="w-full flex items-center justify-between p-3 
                           hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl 
                           transition-colors duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg
                                   group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50
                                   transition-colors duration-200">
                      <item.icon size={16} className="text-gray-600 dark:text-gray-400
                                                    group-hover:text-blue-500" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {item.label}
                    </span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                      {item.badge}
                    </span>
                  )}
                </motion.button>
              ))}
              
              {/* Logout Button */}
              <motion.button
                whileHover={{ x: 4 }}
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 mt-2 
                         hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl 
                         transition-colors duration-200 group border-t 
                         border-gray-200/50 dark:border-gray-700/50"
              >
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg
                               group-hover:bg-red-100 dark:group-hover:bg-red-900/50
                               transition-colors duration-200">
                  <LogOut size={16} className="text-gray-600 dark:text-gray-400
                                             group-hover:text-red-500" />
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-medium
                               group-hover:text-red-600 dark:group-hover:text-red-400">
                  Keluar
                </span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Theme Toggle Button
const ThemeToggle = ({ isDark, toggleTheme }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    onClick={toggleTheme}
    className="fixed top-6 right-6 z-50 p-3 bg-white/90 dark:bg-gray-900/90 
               backdrop-blur-md border border-white/20 dark:border-gray-700/50
               rounded-full shadow-lg hover:shadow-xl transition-all duration-300
               text-gray-900 dark:text-white"
  >
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={isDark ? 'dark' : 'light'}
        initial={{ y: -20, opacity: 0, rotate: -180 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        exit={{ y: 20, opacity: 0, rotate: 180 }}
        transition={{ duration: 0.3 }}
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </motion.div>
    </AnimatePresence>
  </motion.button>
);

// Main Portfolio Page
const PortfolioHome = ({ isDark, toggleTheme }) => {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchPortfolioItems();
  }, []);

  const fetchPortfolioItems = async () => {
    try {
      const response = await axios.get(`${API}/projects`);
      setPortfolioItems(response.data);
    } catch (error) {
      console.error('Error fetching portfolio items:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 
                     flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        ></motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 
                   dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500">
      
      {/* Profile Menu */}
      <ProfileMenu isOpen={isProfileOpen} setIsOpen={setIsProfileOpen} />
      
      {/* Theme Toggle */}
      <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-500/20 rounded-full"
            animate={{
              x: [0, Math.random() * 100, 0],
              y: [0, Math.random() * 100, 0],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.h1 
            className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 
                       bg-clip-text text-transparent mb-6"
            animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
            transition={{ duration: 8, repeat: Infinity }}
            style={{ backgroundSize: '200% 200%' }}
          >
            HoverBoard
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed"
          >
            Portfolio interaktif dimana setiap hover mengungkap cerita tersembunyi, 
            insight teknis, dan detail mengejutkan tentang setiap proyek.
          </motion.p>
          
          {/* Decorative Line */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100px" }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mx-auto mt-8 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
          ></motion.div>
        </motion.div>

        {/* Portfolio Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          {portfolioItems.map((item, index) => (
            <PortfolioCard key={item.id} item={item} index={index} />
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-center mt-20 pb-12"
        >
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Hover pada kartu manapun untuk menemukan insight tersembunyi dan detail teknis
          </p>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Klik pada kartu untuk melihat detail lengkap proyek
          </p>
          <div className="flex justify-center gap-6">
            <a 
              href="https://github.com" 
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors"
            >
              <Github size={20} />
              <span>Lihat di GitHub</span>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// User Profile Page Component  
const UserProfilePage = ({ isDark, toggleTheme }) => {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [userProjects, setUserProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    fetchUserProjects();
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API}/users/${username}`);
      setProfileUser(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setProfileUser(null);
    }
  };

  const fetchUserProjects = async () => {
    try {
      const response = await axios.get(`${API}/users/${username}/projects`);
      setUserProjects(response.data);
    } catch (error) {
      console.error('Error fetching user projects:', error);
      setUserProjects([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 
                     flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        ></motion.div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 
                     flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Pengguna tidak ditemukan</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Username "@{username}" tidak ditemukan di HoverBoard
          </p>
          <Link
            to="/"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.username === username;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 
                   dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500">
      
      {/* Navigation */}
      {isAuthenticated && <ProfileMenu isOpen={isProfileOpen} setIsOpen={setIsProfileOpen} />}
      <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />

      {/* Back to Home Button */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-6 right-20 z-50"
      >
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-3 
                   bg-white/90 dark:bg-gray-900/90 backdrop-blur-md 
                   border border-white/20 dark:border-gray-700/50
                   rounded-full shadow-lg hover:shadow-xl transition-all duration-300
                   text-gray-900 dark:text-white"
        >
          <span className="hidden sm:inline">Beranda</span>
          <ExternalLink size={16} />
        </Link>
      </motion.div>

      <div className="container mx-auto px-6 py-12">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="relative inline-block mb-6">
            <img 
              src={profileUser.avatar_url} 
              alt={profileUser.full_name}
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl mx-auto"
            />
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 
                           rounded-full flex items-center justify-center">
              <span className="text-white font-bold">{profileUser.level[0]}</span>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {profileUser.full_name}
          </h1>
          
          <p className="text-xl text-blue-600 dark:text-blue-400 mb-4">
            @{profileUser.username}
          </p>
          
          {profileUser.bio && (
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6">
              {profileUser.bio}
            </p>
          )}
          
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {userProjects.length}
              </p>
              <p className="text-gray-500 dark:text-gray-400">Proyek</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {userProjects.reduce((total, project) => total + project.views, 0)}
              </p>
              <p className="text-gray-500 dark:text-gray-400">Dilihat</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {profileUser.level}
              </p>
              <p className="text-gray-500 dark:text-gray-400">Level</p>
            </div>
          </div>

          {isOwnProfile && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white 
                       rounded-lg font-medium transition-colors duration-200 shadow-lg"
            >
              Edit Profil
            </motion.button>
          )}
        </motion.div>

        {/* Projects Section */}
        {userProjects.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Proyek {isOwnProfile ? 'Saya' : profileUser.full_name}
              </h2>
              <div className="mx-auto w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              {userProjects.map((project, index) => (
                <PortfolioCard key={project.id} item={project} index={index} />
              ))}
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full 
                           flex items-center justify-center mx-auto mb-6">
              <Sparkles size={32} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {isOwnProfile ? 'Belum Ada Proyek' : 'Belum Ada Proyek Publik'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {isOwnProfile 
                ? 'Mulai tambahkan proyek pertama Anda untuk ditampilkan di sini.'
                : `${profileUser.full_name} belum menambahkan proyek publik.`}
            </p>
            {isOwnProfile && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 
                         hover:from-blue-600 hover:to-purple-700 text-white font-medium 
                         rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Tambah Proyek Pertama
              </motion.button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

// Public Route Component (redirect to profile if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // If user is authenticated but needs username selection
  if (isAuthenticated && user && !user.username) {
    return <Navigate to="/select-username" replace />;
  }
  
  // If user is fully authenticated, redirect to their profile
  if (isAuthenticated && user && user.username) {
    return <Navigate to={`/${user.username}`} replace />;
  }
  
  return children;
};

// Main App Component with Router
function App({ isDark, toggleTheme }) {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/auth" element={
          <PublicRoute>
            <AuthPage isDark={isDark} toggleTheme={toggleTheme} />
          </PublicRoute>
        } />
        
        {/* Protected Routes */}
        <Route path="/select-username" element={
          <ProtectedRoute>
            <UsernameSelectionPage isDark={isDark} toggleTheme={toggleTheme} />
          </ProtectedRoute>
        } />
        
        {/* Public Browse Page (formerly home) */}
        <Route path="/" element={<PortfolioHome isDark={isDark} toggleTheme={toggleTheme} />} />
        
        {/* Project Detail Page */}
        <Route path="/project/:id" element={<ProjectDetail isDark={isDark} toggleTheme={toggleTheme} />} />
        
        {/* User Profile Pages (username-based URLs) */}
        <Route path="/:username" element={<UserProfilePage isDark={isDark} toggleTheme={toggleTheme} />} />
      </Routes>
    </Router>
  );
}

// App with Theme Provider
export default function AppWithTheme() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AuthProvider>
  );
}