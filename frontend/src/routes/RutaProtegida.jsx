import { Navigate, Outlet, useLocation, useOutletContext } from 'react-router-dom'
import { useAutenticacion } from '../context/useAutenticacion.js'

export function RutaProtegida() {
  const { isAuthenticated } = useAutenticacion()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export function RutaPorRol({ allowedRoles }) {
  const inheritedContext = useOutletContext()
  const { user } = useAutenticacion()
  const currentUser = inheritedContext?.user ?? user
  const fallbackPath = inheritedContext?.rutaBase ?? '/app'

  if (!currentUser) return <Navigate to="/login" replace />
  if (!allowedRoles.includes(currentUser.rol)) {
    return <Navigate to={`${fallbackPath}/dashboard`} replace />
  }

  return <Outlet context={inheritedContext} />
}
