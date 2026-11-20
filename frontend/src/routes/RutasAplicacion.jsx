import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ProveedorAutenticacion } from '../context/ContextoAutenticacion.jsx'
import EstructuraAplicacion from '../layouts/EstructuraAplicacion.jsx'
import InicioSesion from '../pages/InicioSesion.jsx'
import RecuperarContrasena from '../pages/RecuperarContrasena.jsx'
import CrearNuevaContrasena from '../pages/CrearNuevaContrasena.jsx'
import RevisaCorreo from '../pages/RevisaCorreo.jsx'
import SelectorRolesDemo from '../pages/SelectorRolesDemo.jsx'
import EspacioDemostracion from '../pages/EspacioDemostracion.jsx'
import PaginaPanel from '../pages/PaginaPanel.jsx'
import PaginaPacientes from '../pages/PaginaPacientes.jsx'
import PaginaCitas from '../pages/PaginaCitas.jsx'
import PaginaExpedientes from '../pages/PaginaExpedientes.jsx'
import PaginaMedicos from '../pages/PaginaMedicos.jsx'
import PaginaUsuarios from '../pages/PaginaUsuarios.jsx'
import PaginaPerfil from '../pages/PaginaPerfil.jsx'
import { RutaProtegida, RutaPorRol } from './RutaProtegida.jsx'

const rutasModulos = [
  { path: 'citas', roles: ['ADMIN', 'DOCTOR'], element: <PaginaCitas /> },
  { path: 'pacientes', roles: ['ADMIN', 'DOCTOR'], element: <PaginaPacientes /> },
  { path: 'expedientes', roles: ['ADMIN', 'DOCTOR'], element: <PaginaExpedientes /> },
  { path: 'medicos', roles: ['ADMIN'], element: <PaginaMedicos /> },
  { path: 'usuarios', roles: ['ADMIN'], element: <PaginaUsuarios /> },
  { path: 'perfil', roles: ['ADMIN', 'DOCTOR', 'PATIENT'], element: <PaginaPerfil /> },
  { path: 'mis-citas', roles: ['PATIENT'], element: <PaginaCitas /> },
  { path: 'mi-expediente', roles: ['PATIENT'], element: <PaginaExpedientes /> },
]

export default function RutasAplicacion() {
  return (
    <ProveedorAutenticacion>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<InicioSesion />} />
          <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
          <Route path="/revisa-correo" element={<RevisaCorreo />} />
          <Route path="/crear-nueva-contrasena" element={<CrearNuevaContrasena />} />
          <Route path="/demo" element={<SelectorRolesDemo />} />
          <Route path="/demo/:role" element={<EspacioDemostracion />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<PaginaPanel />} />
            {rutasModulos.map(({ path, roles: rolesPermitidos, element }) => (
              <Route key={path} path={path} element={<RutaPorRol allowedRoles={rolesPermitidos} />}>
                <Route index element={element} />
              </Route>
            ))}
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>
          <Route element={<RutaProtegida />}>
            <Route path="/app" element={<EstructuraAplicacion />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<PaginaPanel />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ProveedorAutenticacion>
  )
}
