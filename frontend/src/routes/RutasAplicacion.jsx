import { useContext, useMemo } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { ProveedorAutenticacion } from '../context/ContextoAutenticacion.jsx'
import { contextoAutenticacion } from '../context/ContextoAutenticacionCompartido.js'
import { useAutenticacion } from '../context/useAutenticacion.js'
import axiosClient from '../config/axiosClient'

import EstructuraAplicacion from '../layouts/EstructuraAplicacion.jsx'
import InicioSesion from '../pages/InicioSesion.jsx'
import RecuperarContrasena from '../pages/RecuperarContrasena.jsx'
import CrearNuevaContrasena from '../pages/CrearNuevaContrasena.jsx'
import RevisaCorreo from '../pages/RevisaCorreo.jsx'

import PaginaPanel from '../pages/PaginaPanel.jsx'
import PaginaPacientes from '../pages/PaginaPacientes.jsx'
import PaginaCitas from '../pages/PaginaCitas.jsx'
import PaginaExpedientes from '../pages/PaginaExpedientes.jsx'
import PaginaMedicos from '../pages/PaginaMedicos.jsx'
import PaginaUsuarios from '../pages/PaginaUsuarios.jsx'
import PaginaPerfil from '../pages/PaginaPerfil.jsx'
import { RutaProtegida, RutaPorRol } from './RutaProtegida.jsx'
import { NAVEGACION_POR_ROL, ROLES } from '../config/navegacion.js'

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

function leerPayloadJwt(token) {
  const segmentoPayload = token.split('.')[1]
  if (!segmentoPayload) throw new Error('El servidor devolvió un token inválido.')

  const base64 = segmentoPayload.replace(/-/g, '+').replace(/_/g, '/')
  const bytes = atob(base64)
  const json = decodeURIComponent(
    bytes
      .split('')
      .map((caracter) => '%' + ('00' + caracter.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  )
  const payload = JSON.parse(json)
  if (payload.exp && payload.exp * 1000 <= Date.now()) {
    throw new Error('El token de acceso ya expiró. Intenta iniciar sesión de nuevo.')
  }
  return payload
}

function normalizarUsuario(usuario) {
  if (!usuario) return null
  const rol = usuario.rol ?? usuario.role
  return {
    ...usuario,
    rol,
    role: rol,
    nombre: usuario.nombre ?? usuario.name,
    name: usuario.name ?? usuario.nombre,
  }
}

function obtenerRutaInicial(rol) {
  const primeraRuta = NAVEGACION_POR_ROL[rol]?.[0]?.path ?? 'dashboard'
  return `/app/${primeraRuta}`
}

function PaginaLogin() {
  const { establishSession } = useContext(contextoAutenticacion)
  const { user, isAuthenticated } = useAutenticacion()
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
        throw new Error(
          'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.',
          { cause: error },
        )
      }
      if (error.response.status === 401) {
        throw new Error('El correo electrónico o la contraseña son incorrectos.', { cause: error })
      }
      throw new Error(
        error.response.data?.mensaje || 'No fue posible iniciar sesión. Intenta de nuevo.',
        { cause: error },
      )
    }

    const token = response.data?.token
    if (typeof token !== 'string' || !token) {
      throw new Error('El servidor no devolvió un token de acceso válido.')
    }

    const payload = leerPayloadJwt(token)
    const rol = payload.rol ?? payload.role

    if (!Object.values(ROLES).includes(rol)) {
      throw new Error('Tu cuenta tiene un rol no reconocido. Solicita ayuda al administrador.')
    }

    const usuario = normalizarUsuario({
      email: payload.sub,
      rol,
      nombre: payload.nombre,
      id: payload.usuarioId,
      patientId: payload.patientId,
      doctorId: payload.doctorId,
    })

    establishSession({ user: usuario, accessToken: token })
    navigate(obtenerRutaInicial(rol), { replace: true })
  }

  if (isAuthenticated && Object.values(ROLES).includes(user?.role ?? user?.rol)) {
    return <Navigate to={obtenerRutaInicial(user.role ?? user.rol)} replace />
  }

  return <InicioSesion onLogin={manejarLogin} />
}

function AppReal() {
  const { user: usuarioSesion, clearSession } = useAutenticacion()
  const navigate = useNavigate()
  const user = useMemo(() => normalizarUsuario(usuarioSesion), [usuarioSesion])

 
const alCerrarSesion = async () => {
  try {
    await axiosClient.post('/autenticacion/logout')
  } catch (error) {
    console.error('No se pudo invalidar la sesión en el servidor.', error)
  } finally {
    clearSession()
    navigate('/login', { replace: true })
  }
}


  return (
    <EstructuraAplicacion
      user={user}
      rutaBase="/app"
      alCerrarSesion={alCerrarSesion}
    />
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