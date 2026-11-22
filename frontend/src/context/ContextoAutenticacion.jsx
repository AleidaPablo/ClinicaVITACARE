import { useCallback, useMemo, useState, useContext } from 'react'
import { contextoAutenticacion } from './ContextoAutenticacionCompartido.js'

export function ProveedorAutenticacion({ children }) {
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('usuario');
    if (token && user) {
      return { accessToken: token, user: JSON.parse(user) };
    }
    return null;
  })

  const establishSession = useCallback(({ user, accessToken }) => {
    setSession({ user, accessToken })
  }, [])

  const clearSession = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
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

export function useAutenticacion() {
  return useContext(contextoAutenticacion);
}