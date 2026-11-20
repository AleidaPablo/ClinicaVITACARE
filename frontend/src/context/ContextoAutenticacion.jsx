import { useCallback, useMemo, useState } from 'react'
import { contextoAutenticacion } from './ContextoAutenticacionCompartido.js'

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

  return <contextoAutenticacion.Provider value={value}>{children}</contextoAutenticacion.Provider>
}
