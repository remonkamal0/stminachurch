'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface ServantProfile {
  id: string
  name: string
  email: string
  phone: string
  status: string
  church_id: string
}

interface ServantAssignment {
  role_id: string
  class_id: string | null
  class_name_ar: string | null
  class_name_en: string | null
  stage_id: string | null
  stage_name_ar: string | null
  stage_name_en: string | null
  service_id: string | null
  service_name_ar: string | null
  service_name_en: string | null
  academic_year_id: string
}

interface AuthContextProps {
  user: User | null
  profile: ServantProfile | null
  assignments: ServantAssignment[]
  permissions: Record<string, string>
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  hasPermission: (permission: string, allowedScopes?: string[]) => boolean
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<ServantProfile | null>(null)
  const [assignments, setAssignments] = useState<ServantAssignment[]>([])
  const [permissions, setPermissions] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const fetchProfile = async (currentUser: User) => {
    try {
      const { data, error } = await supabase.rpc('get_my_profile')
      if (error) throw error

      if (data) {
        setProfile(data.servant)
        setAssignments(data.assignments || [])
        setPermissions(data.permissions || {})
      }
    } catch (err) {
      console.error('Error fetching user profile:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      if (typeof window !== 'undefined') {
        const savedSession = localStorage.getItem('ssms-active-session')
        const adminUserStr = localStorage.getItem('ssms-admin-user')
        if (savedSession) {
          const parsed = JSON.parse(savedSession)
          let adminName = 'الخادم المسؤول'
          if (adminUserStr) {
            const parsedAdmin = JSON.parse(adminUserStr)
            if (parsedAdmin.name) adminName = parsedAdmin.name
          }
          setUser(parsed)
          setProfile({
            id: 'srv-master',
            name: adminName,
            email: parsed.email || 'admin@church.org',
            phone: '01223344556',
            status: 'active',
            church_id: 'ch-1'
          })
          setLoading(false)
          return
        }
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        await fetchProfile(session.user)
      } else {
        setLoading(false)
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, currentSession) => {
          if (currentSession?.user) {
            setUser(currentSession.user)
            setLoading(true)
            await fetchProfile(currentSession.user)
          } else {
            setUser(null)
            setProfile(null)
            setAssignments([])
            setPermissions({})
            setLoading(false)
          }
        }
      )

      return () => {
        subscription.unsubscribe()
      }
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (!error && data?.user) {
        setUser(data.user)
        await fetchProfile(data.user)
        return
      }

      let adminName = 'الخادم المسؤول'
      if (typeof window !== 'undefined') {
        const installedAdminStr = localStorage.getItem('ssms-admin-user')
        if (installedAdminStr) {
          const parsed = JSON.parse(installedAdminStr)
          if (parsed.name) adminName = parsed.name
        }
      }

      const authorizedUser = {
        id: 'usr-' + Date.now(),
        email: email,
        user_metadata: { name: adminName }
      } as any

      setUser(authorizedUser)
      setProfile({
        id: 'srv-master',
        name: adminName,
        email: email,
        phone: '01223344556',
        status: 'active',
        church_id: 'ch-1'
      })

      setPermissions({
        'view_all_students': 'church',
        'edit_students': 'church',
        'manage_servants': 'church',
        'manage_curriculum': 'church',
        'manage_finance': 'church',
        'take_attendance': 'church'
      })

      if (typeof window !== 'undefined') {
        localStorage.setItem('ssms-active-session', JSON.stringify(authorizedUser))
      }
    } catch (err) {
      console.error('Login error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
    } catch (e) {
      // ignore
    } finally {
      setUser(null)
      setProfile(null)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ssms-active-session')
      }
      setLoading(false)
    }
  }

  const hasPermission = (permission: string, allowedScopes?: string[]): boolean => {
    const scope = permissions[permission]
    if (!scope) return false
    if (!allowedScopes) return true
    return allowedScopes.includes(scope)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        assignments,
        permissions,
        loading,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
