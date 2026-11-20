import { Navigate, Outlet, useNavigate, useParams } from 'react-router-dom'
import EstructuraAplicacion from '../layouts/EstructuraAplicacion.jsx'
import { USUARIOS_DEMOSTRACION } from '../data/usuariosDemostracion.js'
import { ProveedorDatosDemostracion } from '../context/ProveedorDatosDemostracion.jsx'

export default function EspacioDemostracion() {
  const { role } = useParams()
  const navigate = useNavigate()
  const user = USUARIOS_DEMOSTRACION[role?.toLowerCase()]

  if (!user) return <Navigate to="/demo" replace />

  const rutaBase = `/demo/${role.toLowerCase()}`

  return (
    <ProveedorDatosDemostracion>
      <EstructuraAplicacion
        user={user}
        rutaBase={rutaBase}
        modoDemostracion
        alCerrarSesion={() => navigate('/demo')}
      >
        <Outlet context={{ user, rutaBase, modoDemostracion: true }} />
      </EstructuraAplicacion>
    </ProveedorDatosDemostracion>
  )
}
