import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import Icono from '../components/Icono.jsx'
import ModalFormulario from '../components/ModalFormulario.jsx'
import { useDatosDemostracion } from '../context/useDatosDemostracion.js'
import { normalizarDatosFormulario, validarCorreo, validarTelefono } from '../utilidades/validacionesFormulario.js'
import axiosClient from '../config/axiosClient'

const usuarioVacio = { name: '', email: '', phone: '', department: '', role: 'PATIENT', status: 'Activo', password: '' }
const nombresRoles = { ADMIN: 'Administrador', DOCTOR: 'Médico', PATIENT: 'Paciente' }

export default function PaginaUsuarios() {
  const { modoDemostracion } = useOutletContext()
  const { usuarios: usuariosDemo, establecerUsuarios: establecerUsuariosDemo } = useDatosDemostracion()

  const [usuariosReales, setUsuariosReales] = useState([])
  const [cargando, setCargando] = useState(modoDemostracion === false)
  const [errorServidor, setErrorServidor] = useState('')

  const [busqueda, establecerBusqueda] = useState('')
  const [rolFiltro, establecerRolFiltro] = useState('Todos')
  const [modal, establecerModal] = useState(null)
  const [formulario, establecerFormulario] = useState(usuarioVacio)
  const [errores, establecerErrores] = useState({})

  const esModoReal = modoDemostracion === false

  const cargarUsuarios = async () => {
    if (!esModoReal) return
    setCargando(true)
    setErrorServidor('')
    try {
      const res = await axiosClient.get('/usuarios', {
        params: {
          search: busqueda || undefined,
          rol: rolFiltro !== 'Todos' ? rolFiltro : undefined,
          size: 50
        }
      })

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

      setUsuariosReales(mapeados)
    } catch (err) {
      console.error('Error al cargar usuarios:', err)
      setErrorServidor(err.response?.data?.mensaje || 'Error al conectar con el servidor para cargar usuarios.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarUsuarios()
  }, [esModoReal, busqueda, rolFiltro])

  const usuarios = esModoReal ? usuariosReales : usuariosDemo

  const visibles = useMemo(() => {
    if (esModoReal) return usuarios
    return usuarios.filter(
      (usuario) =>
        `${usuario.name} ${usuario.email}`.toLowerCase().includes(busqueda.toLowerCase()) &&
        (rolFiltro === 'Todos' || usuario.role === rolFiltro)
    )
  }, [usuarios, busqueda, rolFiltro, esModoReal])

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

    const erroresValidacion = Object.fromEntries(
      camposValidar.map((campo) => [campo, validarCampo(campo, datos[campo])]).filter(([, error]) => error)
    )
    establecerErrores(erroresValidacion)
    if (Object.keys(erroresValidacion).length) return

    if (esModoReal) {
      const payload = {
        nombreCompleto: datos.name,
        email: datos.email,
        telefono: datos.phone || '',
        departamento: datos.department || '',
        rol: datos.role || 'PATIENT',
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
    } else {
      if (modal === 'editar') {
        establecerUsuariosDemo((lista) => lista.map((u) => (u.id === formulario.id ? { ...u, ...datos } : u)))
      } else {
        establecerUsuariosDemo((lista) => [{ ...datos, id: `U-${String(Date.now()).slice(-4)}` }, ...lista])
      }
      establecerModal(null)
    }
  }

  async function cambiarEstado(usuario) {
    if (esModoReal) {
      try {
        await axiosClient.patch(`/usuarios/${usuario.id}/estado`)
        await cargarUsuarios()
      } catch (err) {
        console.error('Error al cambiar estado de usuario:', err)
        alert(err.response?.data?.mensaje || 'Error al cambiar estado del usuario.')
      }
    } else {
      establecerUsuariosDemo((lista) =>
        lista.map((item) => (item.id === usuario.id ? { ...item, status: item.status === 'Activo' ? 'Suspendido' : 'Activo' } : item))
      )
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
          <span><small>Cuentas registradas</small><strong>{cargando ? '…' : usuarios.length}</strong></span>
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
              onChange={(e) => establecerBusqueda(e.target.value)}
            />
          </label>
          <label>
            Rol
            <select value={rolFiltro} onChange={(e) => establecerRolFiltro(e.target.value)}>
              <option>Todos</option>
              <option value="ADMIN">Administrador</option>
              <option value="DOCTOR">Médico</option>
              <option value="PATIENT">Paciente</option>
            </select>
          </label>
        </div>

        {cargando ? (
          <div className="estado-vacio">Cargando usuarios desde la base de datos…</div>
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
                {visibles.map((usuario) => (
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
            {!visibles.length && <div className="estado-vacio">No encontramos cuentas con esos filtros.</div>}
          </div>
        )}
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
                Contraseña inicial (opcional: por defecto Vitacare123!)
                <input name="password" type="password" placeholder="Vitacare123!" />
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
            <label>
              Rol
              <select name="role" defaultValue={formulario.role}>
                <option value="PATIENT">Paciente</option>
                <option value="DOCTOR">Médico</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </label>
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
