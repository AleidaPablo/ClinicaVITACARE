import { useCallback, useMemo, useState } from 'react'
import { contextoAutenticacion } from './ContextoAutenticacionCompartido.js'

export function ProveedorAutenticacion({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const token = sessionStorage.getItem('token')
      const usuarioGuardado = sessionStorage.getItem('usuario')
      if (token && usuarioGuardado) {
        return { accessToken: token, user: JSON.parse(usuarioGuardado) }
      }
    } catch {
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('usuario')
    }
    return null
  })

  const establishSession = useCallback(({ user, accessToken }) => {
    sessionStorage.setItem('token', accessToken)
    sessionStorage.setItem('usuario', JSON.stringify(user))
    setSession({ user, accessToken })
  }, [])

  const clearSession = useCallback(() => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('usuario')
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