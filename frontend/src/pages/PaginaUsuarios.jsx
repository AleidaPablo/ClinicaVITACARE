import { useMemo, useState } from 'react'
import Icono from '../components/Icono.jsx'
import ModalFormulario from '../components/ModalFormulario.jsx'
import { useDatosDemostracion } from '../context/useDatosDemostracion.js'
import { normalizarDatosFormulario, validarCorreo, validarTelefono } from '../utilidades/validacionesFormulario.js'

const usuarioVacio = { name: '', email: '', phone: '', department: '', role: 'PATIENT', status: 'Activo' }
const nombresRoles = { ADMIN: 'Administrador', DOCTOR: 'Médico', PATIENT: 'Paciente' }

export default function PaginaUsuarios() {
  const { usuarios, establecerUsuarios } = useDatosDemostracion()
  const [busqueda, establecerBusqueda] = useState('')
  const [rolFiltro, establecerRolFiltro] = useState('Todos')
  const [modal, establecerModal] = useState(null)
  const [formulario, establecerFormulario] = useState(usuarioVacio)
  const [errores, establecerErrores] = useState({})
  const visibles = useMemo(() => usuarios.filter((usuario) => `${usuario.name} ${usuario.email}`.toLowerCase().includes(busqueda.toLowerCase()) && (rolFiltro === 'Todos' || usuario.role === rolFiltro)), [usuarios, busqueda, rolFiltro])
  function abrir(usuario) { establecerFormulario(usuario ? { ...usuario } : usuarioVacio); establecerErrores({}); establecerModal(usuario ? 'editar' : 'nuevo') }
  function validarCampo(nombre, valor) {
    const texto = String(valor ?? '').trim()
    if (nombre === 'name' && !texto) return 'Escribe el nombre completo.'
    if (nombre === 'phone') return validarTelefono(texto)
    if (nombre === 'email') {
      const error = validarCorreo(texto)
      if (error) return error
      if (usuarios.some((usuario) => usuario.email.toLowerCase() === texto.toLowerCase() && usuario.id !== formulario.id)) return 'Ese correo ya está registrado.'
    }
    return ''
  }
  function gestionarCambio(evento) { const { name, value } = evento.target; establecerErrores((actuales) => ({ ...actuales, [name]: validarCampo(name, value) })) }
  function guardar(evento) {
    evento.preventDefault()
    const datos = normalizarDatosFormulario(evento.currentTarget)
    const erroresValidacion = Object.fromEntries(['name', 'email', 'phone'].map((campo) => [campo, validarCampo(campo, datos[campo])]).filter(([, error]) => error))
    establecerErrores(erroresValidacion)
    if (Object.keys(erroresValidacion).length) return
    if (modal === 'editar') establecerUsuarios((lista) => lista.map((usuario) => usuario.id === formulario.id ? { ...usuario, ...datos } : usuario))
    else establecerUsuarios((lista) => [{ ...datos, id: `U-${String(Date.now()).slice(-4)}` }, ...lista])
    establecerModal(null)
  }
  function cambiarEstado(usuario) { establecerUsuarios((lista) => lista.map((item) => item.id === usuario.id ? { ...item, status: item.status === 'Activo' ? 'Suspendido' : 'Activo' } : item)) }

  return <div className="pila-pagina"><div className="encabezado-pagina"><div><h1>Gestión de usuarios</h1><p>Cuentas y asignación de roles.</p></div><button className="accion-principal" type="button" onClick={() => abrir(null)}>＋ Crear usuario</button></div><section className="resumen-modulo-grid" aria-label="Resumen de cuentas"><article className="resumen-modulo-card"><span className="resumen-icono"><Icono name="users" size={17} /></span><span><small>Cuentas registradas</small><strong>{usuarios.length}</strong></span></article><article className="resumen-modulo-card"><span className="resumen-icono"><Icono name="doctors" size={17} /></span><span><small>Médicos</small><strong>{usuarios.filter((usuario) => usuario.role === 'DOCTOR').length}</strong></span></article><article className="resumen-modulo-card"><span className="resumen-icono"><Icono name="patients" size={17} /></span><span><small>Pacientes</small><strong>{usuarios.filter((usuario) => usuario.role === 'PATIENT').length}</strong></span></article></section><section className="tarjeta-contenido"><div className="barra-modulo"><label className="busqueda-pacientes"><input aria-label="Buscar usuario" placeholder="Buscar por nombre o correo…" value={busqueda} onChange={(e) => establecerBusqueda(e.target.value)} /></label><label>Rol<select value={rolFiltro} onChange={(e) => establecerRolFiltro(e.target.value)}><option>Todos</option><option value="ADMIN">Administrador</option><option value="DOCTOR">Médico</option><option value="PATIENT">Paciente</option></select></label></div><div className="desplazamiento-tabla"><table className="tabla-datos"><thead><tr><th>Cuenta</th><th>Contacto y área</th><th>Rol</th><th>Último acceso</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{visibles.map((usuario) => <tr key={usuario.id}><td><span className="celda-paciente"><span className="avatar-paciente">{usuario.name.slice(0, 1)}</span><span><strong>{usuario.name}</strong><small>{usuario.email}</small></span></span></td><td><span className="contacto-usuario"><strong>{usuario.phone || 'Sin teléfono'}</strong><small>{usuario.department || 'Área sin asignar'}</small></span></td><td><span className={`etiqueta-rol rol-${usuario.role.toLowerCase()}`}>{nombresRoles[usuario.role]}</span></td><td>{usuario.lastAccess || 'Sin accesos'}</td><td><span className={`etiqueta-estado ${usuario.status === 'Activo' ? 'estado-confirmado' : 'estado-pendiente'}`}>{usuario.status}</span></td><td><div className="acciones-tabla"><button type="button" onClick={() => abrir(usuario)}>Editar</button><button type="button" onClick={() => cambiarEstado(usuario)}>{usuario.status === 'Activo' ? 'Suspender' : 'Reactivar'}</button></div></td></tr>)}</tbody></table></div>{!visibles.length && <div className="estado-vacio">No encontramos cuentas con esos filtros.</div>}</section>
    {modal && <ModalFormulario titulo={modal === 'nuevo' ? 'Crear cuenta' : 'Editar cuenta'} descripcion="Datos de acceso y nivel de permisos." alCerrar={() => establecerModal(null)}><form className="formulario-modulo" noValidate onSubmit={guardar}><label>Nombre<input name="name" defaultValue={formulario.name} onChange={gestionarCambio} aria-invalid={Boolean(errores.name)} />{errores.name && <small className="error-campo">{errores.name}</small>}</label><label>Correo<input name="email" type="email" defaultValue={formulario.email} onChange={gestionarCambio} aria-invalid={Boolean(errores.email)} />{errores.email && <small className="error-campo">{errores.email}</small>}</label><label>Teléfono<input name="phone" type="tel" inputMode="numeric" defaultValue={formulario.phone} onChange={gestionarCambio} aria-invalid={Boolean(errores.phone)} />{errores.phone && <small className="error-campo">{errores.phone}</small>}</label><label>Área o departamento<input name="department" defaultValue={formulario.department} /></label><label>Rol<select name="role" defaultValue={formulario.role}><option value="PATIENT">Paciente</option><option value="DOCTOR">Médico</option><option value="ADMIN">Administrador</option></select></label><label>Estado<select name="status" defaultValue={formulario.status}><option>Activo</option><option>Suspendido</option></select></label><div className="modal-pie interno"><button className="boton-secundario" type="button" onClick={() => establecerModal(null)}>Cancelar</button><button className="accion-principal" type="submit">Guardar cuenta</button></div></form></ModalFormulario>}
  </div>
}
