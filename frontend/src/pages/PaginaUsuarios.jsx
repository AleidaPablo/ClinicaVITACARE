import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import Icono from '../components/Icono.jsx'
import ModalFormulario from '../components/ModalFormulario.jsx'

import { normalizarDatosFormulario, validarContrasena, validarCorreo, validarTelefono } from '../utilidades/validacionesFormulario.js'
import axiosClient from '../config/axiosClient'

const usuarioVacio = { name: '', email: '', phone: '', department: '', role: 'PATIENT', status: 'Activo', password: '' }
const nombresRoles = { ADMIN: 'Administrador', DOCTOR: 'Médico', PATIENT: 'Paciente' }

export default function PaginaUsuarios() {
  const { user } = useOutletContext()

  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorServidor, setErrorServidor] = useState('')

  const [paginaActual, setPaginaActual] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalElementos, setTotalElementos] = useState(0)

  const [busqueda, establecerBusqueda] = useState('')
  const [rolFiltro, establecerRolFiltro] = useState('Todos')
  const [modal, establecerModal] = useState(null)
  const [formulario, establecerFormulario] = useState(usuarioVacio)
  const [errores, establecerErrores] = useState({})

  const cargarUsuarios = useCallback(async (signal) => {
    setCargando(true)
    setErrorServidor('')
    try {
      const res = await axiosClient.get('/usuarios', {
        params: {
          search: busqueda.trim() || undefined,
          rol: rolFiltro !== 'Todos' ? rolFiltro : undefined,
          page: paginaActual,
          size: 10
        },
        signal
      })

      if (signal?.aborted) return
      const mapeados = (res.data?.content || []).map((u) => ({
        id: u.id,
        name: u.nombreCompleto,
        email: u.email,
        phone: u.telefono || '',
        department: u.departamento || '',
        role: u.rol || 'PATIENT',
        status: u.activo ? 'Activo' : 'Suspendido',
        lastAccess: u.ultimoAcceso ? new Date(u.ultimoAcceso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Sin accesos'
      }))

      setUsuarios(mapeados)
      setTotalPaginas(res.data?.totalPages || 1)
      setTotalElementos(res.data?.totalElements || 0)
    } catch (err) {
      if (signal?.aborted) return
      console.error('Error al cargar usuarios:', err)
      setErrorServidor(err.response?.data?.mensaje || 'Error al conectar con el servidor para cargar usuarios.')
    } finally {
      if (!signal?.aborted) setCargando(false)
    }
  }, [busqueda, rolFiltro, paginaActual])

  useEffect(() => {
    const controlador = new AbortController()
    Promise.resolve().then(() => {
      if (!controlador.signal.aborted) cargarUsuarios(controlador.signal)
    })
    return () => controlador.abort()
  }, [cargarUsuarios])

  function abrir(usuario) {
    establecerFormulario(usuario ? { ...usuario, password: '' } : usuarioVacio)
    establecerErrores({})
    setErrorServidor('')
    establecerModal(usuario ? 'editar' : 'nuevo')
  }

  function validarCampo(nombre, valor) {
    const texto = String(valor ?? '').trim()
    if (nombre === 'name' && !texto) return 'Escribe el nombre completo.'
    if (nombre === 'phone' && texto) return validarTelefono(texto)
    if (nombre === 'email') {
      const error = validarCorreo(texto)
      if (error) return error
      if (usuarios.some((u) => u.email.toLowerCase() === texto.toLowerCase() && u.id !== formulario.id)) {
        return 'Ese correo ya está registrado.'
      }
    }
    if (nombre === 'password' && texto) return validarContrasena(texto)
    return ''
  }

  function gestionarCambio(evento) {
    const { name, value } = evento.target
    establecerErrores((actuales) => ({ ...actuales, [name]: validarCampo(name, value) }))
  }

  async function guardar(evento) {
    evento.preventDefault()
    setErrorServidor('')
    const datos = normalizarDatosFormulario(evento.currentTarget)
    const camposValidar = ['name', 'email']
    if (datos.phone) camposValidar.push('phone')
    if (datos.password) camposValidar.push('password')
    if (modal === 'nuevo' && !datos.password) {
      establecerErrores((actuales) => ({ ...actuales, password: 'Escribe una contraseña válida.' }))
      return
    }

    const erroresValidacion = Object.fromEntries(
      camposValidar.map((campo) => [campo, validarCampo(campo, datos[campo])]).filter(([, error]) => error)
    )
    establecerErrores(erroresValidacion)
    if (Object.keys(erroresValidacion).length) return

    const payload = {
      nombreCompleto: datos.name,
      email: datos.email,
      telefono: datos.phone || '',
      departamento: datos.department || '',
      rol: datos.role || formulario.role || 'PATIENT',
      activo: datos.status === 'Activo',
      password: datos.password || undefined
    }

    try {
      if (modal === 'editar') {
        await axiosClient.put(`/usuarios/${formulario.id}`, payload)
      } else {
        await axiosClient.post('/usuarios', payload)
      }
      await cargarUsuarios()
      establecerModal(null)
    } catch (err) {
      console.error('Error al guardar usuario:', err)
      setErrorServidor(err.response?.data?.mensaje || err.response?.data?.message || 'Error al guardar el usuario.')
    }
  }

  async function cambiarEstado(usuario) {
    try {
      await axiosClient.patch(`/usuarios/${usuario.id}/estado`)
      await cargarUsuarios()
    } catch (err) {
      console.error('Error al cambiar estado de usuario:', err)
      setErrorServidor(err.response?.data?.mensaje || 'Error al cambiar estado del usuario.')
    }
  }

  return (
    <div className="pila-pagina">
      <div className="encabezado-pagina">
        <div>
          <h1>Gestión de usuarios</h1>
          <p>Cuentas y asignación de roles.</p>
        </div>
        <button className="accion-principal" type="button" onClick={() => abrir(null)}>
          ＋ Crear usuario
        </button>
      </div>

      {errorServidor && (
        <div style={{ backgroundColor: '#fef3f2', color: '#b42318', padding: '12px 16px', borderRadius: '8px', border: '1px solid #fecdca' }}>
          {errorServidor}
        </div>
      )}

      <section className="resumen-modulo-grid" aria-label="Resumen de cuentas">
        <article className="resumen-modulo-card">
          <span className="resumen-icono"><Icono name="users" size={17} /></span>
          <span><small>Cuentas registradas</small><strong>{cargando ? '…' : totalElementos}</strong></span>
        </article>
        <article className="resumen-modulo-card">
          <span className="resumen-icono"><Icono name="doctors" size={17} /></span>
          <span><small>Médicos</small><strong>{cargando ? '…' : usuarios.filter((u) => u.role === 'DOCTOR').length}</strong></span>
        </article>
        <article className="resumen-modulo-card">
          <span className="resumen-icono"><Icono name="patients" size={17} /></span>
          <span><small>Pacientes</small><strong>{cargando ? '…' : usuarios.filter((u) => u.role === 'PATIENT').length}</strong></span>
        </article>
      </section>

      <section className="tarjeta-contenido">
        <div className="barra-modulo">
          <label className="busqueda-pacientes">
            <input
              aria-label="Buscar usuario"
              placeholder="Buscar por nombre o correo…"
              value={busqueda}
              onChange={(e) => {
                establecerBusqueda(e.target.value)
                setPaginaActual(0)
              }}
            />
          </label>
          <label>
            Rol
            <select
              value={rolFiltro}
              onChange={(e) => {
                establecerRolFiltro(e.target.value)
                setPaginaActual(0)
              }}
            >
              <option>Todos</option>
              <option value="ADMIN">Administrador</option>
              <option value="DOCTOR">Médico</option>
              <option value="PATIENT">Paciente</option>
            </select>
          </label>
        </div>

        {cargando ? (
          <div className="estado-vacio">Cargando usuarios…</div>
        ) : (
          <div className="desplazamiento-tabla">
            <table className="tabla-datos">
              <thead>
                <tr>
                  <th>Cuenta</th>
                  <th>Contacto y área</th>
                  <th>Rol</th>
                  <th>Último acceso</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario.id}>
                    <td>
                      <span className="celda-paciente">
                        <span className="avatar-paciente">{(usuario.name || 'U').slice(0, 1)}</span>
                        <span>
                          <strong>{usuario.name}</strong>
                          <small>{usuario.email}</small>
                        </span>
                      </span>
                    </td>
                    <td>
                      <span className="contacto-usuario">
                        <strong>{usuario.phone || 'Sin teléfono'}</strong>
                        <small>{usuario.department || 'Área sin asignar'}</small>
                      </span>
                    </td>
                    <td>
                      <span className={`etiqueta-rol rol-${(usuario.role || 'patient').toLowerCase()}`}>
                        {nombresRoles[usuario.role] ?? usuario.role}
                      </span>
                    </td>
                    <td>{usuario.lastAccess || 'Sin accesos'}</td>
                    <td>
                      <span className={`etiqueta-estado ${usuario.status === 'Activo' ? 'estado-confirmado' : 'estado-pendiente'}`}>
                        {usuario.status}
                      </span>
                    </td>
                    <td>
                      <div className="acciones-tabla">
                        <button type="button" onClick={() => abrir(usuario)}>
                          Editar
                        </button>
                        <button type="button" onClick={() => cambiarEstado(usuario)}>
                          {usuario.status === 'Activo' ? 'Suspender' : 'Reactivar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!usuarios.length && <div className="estado-vacio">No encontramos cuentas con esos filtros.</div>}
          </div>
        )}

        {/* CONTROLES DE PAGINACIÓN */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '0 10px' }}>
          <button
            className="boton-secundario"
            disabled={paginaActual === 0 || cargando}
            onClick={() => setPaginaActual(paginaActual - 1)}
          >
            ← Anterior
          </button>
          <span style={{ fontSize: '14px', color: '#666' }}>
            Página {paginaActual + 1} de {totalPaginas}
          </span>
          <button
            className="boton-secundario"
            disabled={paginaActual >= totalPaginas - 1 || cargando}
            onClick={() => setPaginaActual(paginaActual + 1)}
          >
            Siguiente →
          </button>
        </div>
      </section>

      {modal && (
        <ModalFormulario
          titulo={modal === 'nuevo' ? 'Crear cuenta' : 'Editar cuenta'}
          descripcion="Datos de acceso y nivel de permisos."
          alCerrar={() => establecerModal(null)}
        >
          <form className="formulario-modulo" noValidate onSubmit={guardar}>
            {errorServidor && <p style={{ color: '#b42318', margin: '0 0 10px' }}>{errorServidor}</p>}
            <label>
              Nombre
              <input name="name" defaultValue={formulario.name} onChange={gestionarCambio} aria-invalid={Boolean(errores.name)} />
              {errores.name && <small className="error-campo">{errores.name}</small>}
            </label>
            <label>
              Correo
              <input name="email" type="email" defaultValue={formulario.email} onChange={gestionarCambio} aria-invalid={Boolean(errores.email)} />
              {errores.email && <small className="error-campo">{errores.email}</small>}
            </label>
            {modal === 'nuevo' && (
              <label>
                Contraseña inicial
                <input name="password" type="password" onChange={gestionarCambio} aria-invalid={Boolean(errores.password)} />
                {errores.password && <small className="error-campo">{errores.password}</small>}
              </label>
            )}
            <label>
              Teléfono
              <input name="phone" type="tel" inputMode="numeric" defaultValue={formulario.phone} onChange={gestionarCambio} aria-invalid={Boolean(errores.phone)} />
              {errores.phone && <small className="error-campo">{errores.phone}</small>}
            </label>
            <label>
              Área o departamento
              <input name="department" defaultValue={formulario.department} />
            </label>
            {(modal === 'nuevo' || String(formulario.id) !== String(user?.id)) && (
              <label>
                Rol
                <select name="role" defaultValue={formulario.role}>
                  <option value="PATIENT">Paciente</option>
                  <option value="DOCTOR">Médico</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </label>
            )}
            <label>
              Estado
              <select name="status" defaultValue={formulario.status}>
                <option>Activo</option>
                <option>Suspendido</option>
              </select>
            </label>
            <div className="modal-pie interno">
              <button className="boton-secundario" type="button" onClick={() => establecerModal(null)}>
                Cancelar
              </button>
              <button className="accion-principal" type="submit">
                Guardar cuenta
              </button>
            </div>
          </form>
        </ModalFormulario>
      )}
    </div>
  )
}
