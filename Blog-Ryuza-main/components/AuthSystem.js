import React, { useState, useEffect } from 'react'
import { Eye, EyeOff, User, Mail, Lock, Github, Chrome, ArrowRight, CheckCircle, XCircle, Loader } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const AuthSystem = ({ initialPage = 'home' }) => {
  const { signUp, signIn, signInWithOAuth, checkUsernameAvailability } = useAuth()
  
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [usernameAvailable, setUsernameAvailable] = useState(null)
  const [checkingUsername, setCheckingUsername] = useState(false)

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({ 
    username: '', 
    email: '', 
    password: '',
    confirmPassword: ''
  })

  const validateUsername = (username) => {
    const regex = /^[a-zA-Z0-9_]{3,20}$/
    return regex.test(username)
  }

  const checkUsername = async (username) => {
    if (!validateUsername(username)) {
      setUsernameAvailable(false)
      return
    }
    
    setCheckingUsername(true)
    try {
      const { available, error } = await checkUsernameAvailability(username)
      if (error) {
        console.error('Username check error:', error)
        setUsernameAvailable(null)
      } else {
        setUsernameAvailable(available)
      }
    } catch (err) {
      console.error('Username check failed:', err)
      setUsernameAvailable(null)
    }
    setCheckingUsername(false)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (signupForm.username.length >= 3) {
        checkUsername(signupForm.username)
      } else {
        setUsernameAvailable(null)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [signupForm.username])

  const handleLogin = async (e) => {
    e?.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await signIn({
        email: loginForm.email,
        password: loginForm.password
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Login successful! Redirecting...')
      }
    } catch (err) {
      setError(err.message || 'Login failed')
    }
    setLoading(false)
  }

  const handleSignup = async (e) => {
    e?.preventDefault()
    setLoading(true)
    setError('')

    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (!usernameAvailable) {
      setError('Username is not available or invalid')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await signUp({
        email: signupForm.email,
        password: signupForm.password,
        username: signupForm.username
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Account created! Please check your email to verify.')
      }
    } catch (err) {
      setError(err.message || 'Signup failed')
    }
    setLoading(false)
  }

  const handleOAuthLogin = async (provider) => {
    setLoading(true)
    setError('')
    
    try {
      const { data, error } = await signInWithOAuth(provider)
      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError(err.message || `${provider} login failed`)
    }
    setLoading(false)
  }

  // HomePage Component
  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-12">
          <h1 className="text-6xl font-bold text-white mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Blog Ryuza
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Your creative space to share stories, ideas, and connect with a community of writers and readers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setCurrentPage('signup')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            >
              Get Started <ArrowRight size={20} />
            </button>
            <button
              onClick={() => setCurrentPage('login')}
              className="border-2 border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300"
            >
              Sign In
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 text-left">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
              <User className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Personal Profiles</h3>
            <p className="text-gray-300">Create your unique profile with custom username URLs</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
              <Lock className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Secure Authentication</h3>
            <p className="text-gray-300">Advanced security with username-based authentication</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
              <ArrowRight className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Smart Routing</h3>
            <p className="text-gray-300">Intelligent redirects and seamless navigation</p>
          </div>
        </div>
      </div>
    </div>
  )

  // Login Page
  const LoginPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-300">Sign in to continue to Blog Ryuza</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4 flex items-center gap-2">
              <XCircle size={20} className="text-red-400" />
              <span className="text-red-400">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 mb-4 flex items-center gap-2">
              <CheckCircle size={20} className="text-green-400" />
              <span className="text-green-400">{success}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader className="animate-spin" size={20} /> : null}
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleOAuthLogin('google')}
                className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 rounded-lg py-3 text-white hover:bg-white/20 transition-colors"
              >
                <Chrome size={20} />
                Google
              </button>
              <button
                onClick={() => handleOAuthLogin('github')}
                className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 rounded-lg py-3 text-white hover:bg-white/20 transition-colors"
              >
                <Github size={20} />
                GitHub
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <button
                onClick={() => setCurrentPage('signup')}
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                Sign up
              </button>
            </p>
            <button
              onClick={() => setCurrentPage('home')}
              className="text-gray-400 hover:text-gray-300 text-sm mt-2 transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // Signup Page  
  const SignupPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-gray-300">Join the Blog Ryuza community</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4 flex items-center gap-2">
              <XCircle size={20} className="text-red-400" />
              <span className="text-red-400">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 mb-4 flex items-center gap-2">
              <CheckCircle size={20} className="text-green-400" />
              <span className="text-green-400">{success}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={signupForm.username}
                  onChange={(e) => setSignupForm({...signupForm, username: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                  placeholder="Choose a username"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {checkingUsername && <Loader className="animate-spin text-gray-400" size={20} />}
                  {!checkingUsername && usernameAvailable === true && <CheckCircle className="text-green-400" size={20} />}
                  {!checkingUsername && usernameAvailable === false && <XCircle className="text-red-400" size={20} />}
                </div>
              </div>
              {signupForm.username && !validateUsername(signupForm.username) && (
                <p className="text-red-400 text-sm mt-1">Username must be 3-20 characters, alphanumeric + underscore only</p>
              )}
              {usernameAvailable === true && (
                <p className="text-green-400 text-sm mt-1">Username is available!</p>
              )}
              {usernameAvailable === false && validateUsername(signupForm.username) && (
                <p className="text-red-400 text-sm mt-1">Username is already taken</p>
              )}
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={signupForm.confirmPassword}
                  onChange={(e) => setSignupForm({...signupForm, confirmPassword: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                  placeholder="Confirm your password"
                />
              </div>
              {signupForm.confirmPassword && signupForm.password !== signupForm.confirmPassword && (
                <p className="text-red-400 text-sm mt-1">Passwords do not match</p>
              )}
            </div>

            <button
              onClick={handleSignup}
              disabled={loading || !usernameAvailable}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader className="animate-spin" size={20} /> : null}
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleOAuthLogin('google')}
                className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 rounded-lg py-3 text-white hover:bg-white/20 transition-colors"
              >
                <Chrome size={20} />
                Google
              </button>
              <button
                onClick={() => handleOAuthLogin('github')}
                className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 rounded-lg py-3 text-white hover:bg-white/20 transition-colors"
              >
                <Github size={20} />
                GitHub
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <button
                onClick={() => setCurrentPage('login')}
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                Sign in
              </button>
            </p>
            <button
              onClick={() => setCurrentPage('home')}
              className="text-gray-400 hover:text-gray-300 text-sm mt-2 transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // Render current page
  switch (currentPage) {
    case 'login':
      return <LoginPage />
    case 'signup':
      return <SignupPage />
    default:
      return <HomePage />
  }
}

export default AuthSystem
