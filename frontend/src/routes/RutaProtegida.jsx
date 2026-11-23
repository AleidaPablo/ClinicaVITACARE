import { Navigate, Outlet, useLocation, useOutletContext } from 'react-router-dom'
import { useAutenticacion } from '../context/useAutenticacion.js'
import { ROLES } from '../config/navegacion.js'

export function RutaProtegida() {
  const { isAuthenticated, user } = useAutenticacion()
  const location = useLocation()
  const rol = user?.role ?? user?.rol

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!Object.values(ROLES).includes(rol)) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export function RutaPorRol({ allowedRoles }) {
  const inheritedContext = useOutletContext()
  const { user } = useAutenticacion()
  const currentUser = inheritedContext?.user ?? user
  const fallbackPath = inheritedContext?.rutaBase ?? '/app'
  const rol = currentUser?.role ?? currentUser?.rol

  if (!currentUser) return <Navigate to="/login" replace />
  if (!Object.values(ROLES).includes(rol)) return <Navigate to="/login" replace />
  if (!allowedRoles.includes(rol)) {
    return <Navigate to={`${fallbackPath}/dashboard`} replace />
  }

  return <Outlet context={inheritedContext} />
}
