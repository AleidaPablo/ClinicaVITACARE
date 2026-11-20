import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)

export function ProveedorAutenticacion({ children }) {
  const [session, setSession] = useState(null)

  const establishSession = useCallback(({ user, accessToken }) => {
    setSession({ user, accessToken })
  }, [])

  const clearSession = useCallback(() => {
    setSession(null)
  }, [])

  const value = useMemo(() => ({
    user: session?.user ?? null,
    accessToken: session?.accessToken ?? null,
    isAuthenticated: Boolean(session?.user && session?.accessToken),
    establishSession,
    clearSession,
  }), [session, establishSession, clearSession])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function useAutenticacion() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAutenticacion debe utilizarse dentro de ProveedorAutenticacion.')
  return context
}
