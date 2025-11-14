import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type User = { username: string }

type AuthContextType = {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  signup: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const LS_USER_KEY = 'demo_user'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem(LS_USER_KEY)
    if (raw) {
      try { setUser(JSON.parse(raw)) } catch {}
    }
  }, [])

  const login = async (username: string, password: string) => {
    if (!username || !password) return false
    const u = { username }
    localStorage.setItem(LS_USER_KEY, JSON.stringify(u))
    setUser(u)
    return true
  }

  const signup = async (username: string, password: string) => {
    // simulate signup == login
    return login(username, password)
  }

  const logout = () => {
    localStorage.removeItem(LS_USER_KEY)
    setUser(null)
  }

  const value = useMemo(() => ({ user, login, signup, logout }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


