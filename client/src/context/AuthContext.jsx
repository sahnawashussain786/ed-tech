import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { api, setAuthToken } from '../lib/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)

  // Restore session from localStorage on first load
  useEffect(() => {
    const token = localStorage.getItem('lh_token')
    if (!token) {
      setInitializing(false)
      return
    }
    setAuthToken(token)
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('lh_token')
        setAuthToken(null)
      })
      .finally(() => setInitializing(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('lh_token', res.data.token)
    setAuthToken(res.data.token)
    setUser(res.data.user)
    return res.data.user
  }, [])

  const register = useCallback(async (payload) => {
    const res = await api.post('/auth/register', payload)
    localStorage.setItem('lh_token', res.data.token)
    setAuthToken(res.data.token)
    setUser(res.data.user)
    return res.data.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('lh_token')
    setAuthToken(null)
    setUser(null)
  }, [])

  const updateUser = useCallback((u) => setUser(u), [])

  const value = useMemo(
    () => ({ user, initializing, login, register, logout, updateUser }),
    [user, initializing, login, register, logout, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
