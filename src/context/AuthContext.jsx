import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

const STORAGE_KEY = 'washwhiz_session'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    try {
      return JSON.parse(raw)
    } catch (error) {
      return null
    }
  })

  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [session])

  const logout = () => setSession(null)

  const value = useMemo(
    () => ({
      session,
      setSession,
      logout,
      isAuthenticated: Boolean(session),
      isCustomer: session?.role === 'customer',
      isStaff: session?.role === 'staff',
    }),
    [session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
