import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, authHelpers, profileHelpers } from '../lib/supabase'
import { useRouter } from 'next/router'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        const { profile } = await profileHelpers.getProfileByUsername(session.user.user_metadata?.username)
        setProfile(profile)
      }
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          const { profile } = await profileHelpers.getProfileByUsername(session.user.user_metadata?.username)
          setProfile(profile)
          
          // Redirect to profile after successful auth
          if (event === 'SIGNED_IN' && profile?.username) {
            router.push(`/profile/${profile.username}`)
          }
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription?.unsubscribe()
  }, [router])

  const signUp = async ({ email, password, username }) => {
    const { data, error } = await authHelpers.signUp({ email, password, username })
    return { data, error }
  }

  const signIn = async ({ email, password }) => {
    const { data, error } = await authHelpers.signIn({ email, password })
    return { data, error }
  }

  const signInWithOAuth = async (provider) => {
    const { data, error } = await authHelpers.signInWithOAuth(provider)
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await authHelpers.signOut()
    if (!error) {
      router.push('/')
    }
    return { error }
  }

  const checkUsernameAvailability = async (username) => {
    const { available, error } = await profileHelpers.checkUsername(username)
    return { available, error }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    checkUsernameAvailability
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
