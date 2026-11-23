import { useCallback, useMemo, useState } from 'react'
import { contextoAutenticacion } from './ContextoAutenticacionCompartido.js'

export function ProveedorAutenticacion({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const token = localStorage.getItem('token')
      const usuarioGuardado = localStorage.getItem('usuario')
      if (token && usuarioGuardado) {
        return { accessToken: token, user: JSON.parse(usuarioGuardado) }
      }
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
    }
    return null
  })

  const establishSession = useCallback(({ user, accessToken }) => {
    localStorage.setItem('token', accessToken)
    localStorage.setItem('usuario', JSON.stringify(user))
    setSession({ user, accessToken })
  }, [])

  const clearSession = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
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
