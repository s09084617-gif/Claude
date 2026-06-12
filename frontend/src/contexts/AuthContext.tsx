import React, { createContext, useContext, useEffect, useState } from 'react'
import { api, User } from '../api/client'

interface AuthContextValue {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('iblitz_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('iblitz_token')
    if (storedToken) {
      setToken(storedToken)
      api
        .me()
        .then((res) => {
          setUser(res.data)
        })
        .catch(() => {
          localStorage.removeItem('iblitz_token')
          setToken(null)
          setUser(null)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (username: string, password: string) => {
    const res = await api.login(username, password)
    const { access_token } = res.data
    localStorage.setItem('iblitz_token', access_token)
    setToken(access_token)
    const meRes = await api.me()
    setUser(meRes.data)
  }

  const logout = () => {
    localStorage.removeItem('iblitz_token')
    setToken(null)
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const res = await api.me()
      setUser(res.data)
    } catch {
      // ignore — keep stale state rather than logging out
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        refreshUser,
        isAuthenticated: !!token && !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
