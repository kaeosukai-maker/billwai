// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, getProfile, updateProfile } from '../lib/supabase'

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

  useEffect(() => {
    // เช็ค session ปัจจุบัน
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        
        if (session?.user) {
          const { data } = await getProfile(session.user.id)
          setProfile(data)
        }
      } catch (error) {
        console.error('Auth init error:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listen การเปลี่ยนแปลง auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          const { data } = await getProfile(session.user.id)
          setProfile(data)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // อัพเดท profile
  const saveProfile = async (profileData) => {
    if (!user) return { error: 'Not authenticated' }
    
    const { data, error } = await updateProfile(user.id, profileData)
    if (!error) {
      setProfile(data)
    }
    return { data, error }
  }

  // Sign up
  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    })
    return { data, error }
  }

  // Sign in
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
      setProfile(null)
    }
    return { error }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    saveProfile,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
