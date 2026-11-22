import { useContext, useMemo } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { ProveedorAutenticacion, useAutenticacion } from '../context/ContextoAutenticacion.jsx'
import { contextoAutenticacion } from '../context/ContextoAutenticacionCompartido.js'
import axiosClient from '../config/axiosClient'

import { ProveedorDatosDemostracion } from '../context/ProveedorDatosDemostracion.jsx'

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

// Decodifica el payload del JWT (base64url + UTF-8, para que los acentos no se dañen)
function leerPayloadJwt(token) {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  const bytes = atob(base64)
  const json = decodeURIComponent(
    bytes
      .split('')
      .map((caracter) => '%' + ('00' + caracter.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  )
  return JSON.parse(json)
}

function normalizarUsuario(usuario) {
  if (!usuario) return null
  return {
    ...usuario,
    rol: usuario.rol ?? usuario.role,
    role: usuario.role ?? usuario.rol,
    nombre: usuario.nombre ?? usuario.name,
    name: usuario.name ?? usuario.nombre,
  }
}

function PaginaLogin() {
  const { establishSession } = useContext(contextoAutenticacion)
  const navigate = useNavigate()

  const manejarLogin = async (credenciales) => {
    let response
    try {
      response = await axiosClient.post('/autenticacion/login', {
        email: credenciales.email,
        password: credenciales.password,
      })
    } catch (error) {
      if (!error.response) {
        throw new Error('No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.')
      }
      throw new Error(error.response.data?.mensaje || 'Correo o contraseña incorrectos.')
    }

    const token = response.data.token
    const payload = leerPayloadJwt(token)

    const usuario = normalizarUsuario({
      email: payload.sub,
      rol: payload.rol,
      nombre: payload.nombre,
    })

    localStorage.setItem('token', token)
    localStorage.setItem('usuario', JSON.stringify(usuario))

    establishSession({ user: usuario, accessToken: token })
    navigate('/app/dashboard')
  }

  return <InicioSesion onLogin={manejarLogin} />
}

function AppReal() {
  const { user: usuarioSesion, clearSession } = useAutenticacion()
  const navigate = useNavigate()
  const user = useMemo(() => normalizarUsuario(usuarioSesion), [usuarioSesion])

  const alCerrarSesion = () => {
    clearSession()
    navigate('/login')
  }

  return (
    <ProveedorDatosDemostracion>
      <EstructuraAplicacion
        user={user}
        rutaBase="/app"
        modoDemostracion={false}
        alCerrarSesion={alCerrarSesion}
      />
    </ProveedorDatosDemostracion>
  )
}

export default function RutasAplicacion() {
  return (
    <ProveedorAutenticacion>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<PaginaLogin />} />

          <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
          <Route path="/revisa-correo" element={<RevisaCorreo />} />
          <Route path="/crear-nueva-contrasena" element={<CrearNuevaContrasena />} />

          {/* RUTAS DEMO */}
          <Route path="/demo" element={<SelectorRolesDemo />} />
          <Route path="/demo/:role" element={<EspacioDemostracion />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<PaginaPanel />} />
            {rutasModulos.map(({ path, roles, element }) => (
              <Route key={path} path={path} element={<RutaPorRol allowedRoles={roles} />}>
                <Route index element={element} />
              </Route>
            ))}
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* RUTAS REALES (APP) */}
          <Route element={<RutaProtegida />}>
            <Route path="/app" element={<AppReal />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<PaginaPanel />} />

              {rutasModulos.map(({ path, roles, element }) => (
                <Route key={path} path={path} element={<RutaPorRol allowedRoles={roles} />}>
                  <Route index element={element} />
                </Route>
              ))}

              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ProveedorAutenticacion>
  )
}