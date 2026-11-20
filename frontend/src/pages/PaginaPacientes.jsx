import { useMemo, useState } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import Icono from '../components/Icono.jsx'
import EtiquetaEstado from '../components/EtiquetaEstado.jsx'
import ModalFormulario from '../components/ModalFormulario.jsx'
import { useDatosDemostracion } from '../context/useDatosDemostracion.js'

const pacienteVacio = { name: '', email: '', age: '', dateOfBirth: '', sex: '', maritalStatus: '', occupation: '', address: '', phone: '', bloodType: '', emergencyContact: '', emergencyPhone: '', insurance: '', nss: '', status: 'Activo' }

function iniciales(nombre = '') {
  return nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((parte) => parte[0]?.toUpperCase()).join('') || 'PA'
}

export default function PaginaPacientes({ patientOnly = false }) {
  const { user } = useOutletContext()
  const { pacientes, establecerPacientes } = useDatosDemostracion()
  const [params, setParams] = useSearchParams()
  const busqueda = params.get('search') ?? ''
  const [filtroEstado, establecerFiltroEstado] = useState('Todos')
  const [modal, establecerModal] = useState(null)
  const [formulario, establecerFormulario] = useState(pacienteVacio)
  const [errores, establecerErrores] = useState({})
  const esPaciente = patientOnly || user?.role === 'PATIENT'

  const pacientesVisibles = useMemo(() => pacientes.filter((paciente) => {
    const autorizadoParaMedico = user?.role !== 'DOCTOR' || ['P-001', 'P-002', 'P-003'].includes(paciente.id)
    const coincideTexto = `${paciente.id} ${paciente.expediente ?? ''} ${paciente.name} ${paciente.email} ${paciente.phone} ${paciente.nss ?? ''}`.toLocaleLowerCase().includes(busqueda.trim().toLocaleLowerCase())
    return autorizadoParaMedico && coincideTexto && (filtroEstado === 'Todos' || paciente.status === filtroEstado)
  }), [pacientes, busqueda, filtroEstado, user?.role])

  function abrirFormulario(paciente = null) {
    establecerFormulario(paciente ? { ...paciente } : pacienteVacio)
    establecerErrores({})
    establecerModal(paciente ? { tipo: 'editar', paciente } : { tipo: 'nuevo' })
  }

  function guardarPaciente(evento) {
    evento.preventDefault()
    const valores = Object.fromEntries(new FormData(evento.currentTarget))
    const erroresFormulario = {}
    if (!valores.name.trim()) erroresFormulario.name = 'Escribe el nombre del paciente.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valores.email)) erroresFormulario.email = 'Escribe un correo válido.'
    if (!valores.phone.trim()) erroresFormulario.phone = 'Escribe un teléfono de contacto.'
    if (pacientes.some((paciente) => paciente.email.toLowerCase() === valores.email.toLowerCase() && paciente.id !== modal?.paciente?.id)) erroresFormulario.email = 'Ese correo ya está registrado.'
    establecerErrores(erroresFormulario)
    if (Object.keys(erroresFormulario).length) return

    if (modal.tipo === 'editar') {
      establecerPacientes((actuales) => actuales.map((paciente) => paciente.id === modal.paciente.id ? { ...paciente, ...valores, age: Number(valores.age) || 0 } : paciente))
    } else {
      const siguienteId = `P-${String(Date.now()).slice(-4)}`
      establecerPacientes((actuales) => [{ ...valores, id: siguienteId, age: Number(valores.age) || 0, lastVisit: 'Sin visitas' }, ...actuales])
    }
    establecerModal(null)
  }

  if (esPaciente) {
    const paciente = pacientes.find((elemento) => elemento.id === (user?.patientId ?? 'P-001')) ?? pacientes[0]
    return (
      <div className="pila-pagina">
        <div className="encabezado-pagina"><div><h1>Mi expediente</h1><p>Información de tu atención médica.</p></div></div>
        <p className="nota-datos-demo">Consulta tu información personal y clínica.</p>
        <section className="tarjeta-perfil-paciente"><span className="avatar-paciente-grande">{iniciales(user?.name)}</span><div><span className="id-paciente">MI PERFIL</span><h2>{user?.name}</h2><p>{user?.email}</p></div><span className="etiqueta-estado">Vista propia</span></section>
        <section className="tarjeta-contenido"><div className="encabezado-seccion"><div><h2>Resumen del expediente</h2><p>Datos de contacto y atención</p></div></div><div className="ficha-datos-grid resumen-datos-paciente"><div className="dato-ficha"><span>Fecha de nacimiento</span><strong>{paciente?.dateOfBirth || 'Sin registro'}</strong></div><div className="dato-ficha dato-destacado"><span>Tipo de sangre</span><strong>{paciente?.bloodType || 'Sin registro'}</strong></div><div className="dato-ficha ancho-completo"><span>Contacto de emergencia</span><strong>{paciente?.emergencyContact || 'Sin registro'}{paciente?.emergencyPhone ? ` · ${paciente.emergencyPhone}` : ''}</strong></div><div className="dato-ficha"><span>Seguro médico</span><strong>{paciente?.insurance || 'Sin registro'}</strong></div><div className="dato-ficha"><span>Última visita</span><strong>{paciente?.lastVisit ?? 'Sin visitas registradas'}</strong></div></div></section>
      </div>
    )
  }

  return (
    <div className="pila-pagina">
      <div className="encabezado-pagina"><div><h1>Gestión de pacientes</h1><p>Directorio y datos de contacto.</p></div><button className="accion-principal" type="button" onClick={() => abrirFormulario()}><span aria-hidden="true">＋</span> Registrar paciente</button></div>
      <p className="nota-datos-demo">Consulta y administra el directorio de pacientes.</p>
      <section className="resumen-modulo-grid" aria-label="Resumen de pacientes"><article className="resumen-modulo-card"><span className="resumen-icono"><Icono name="patients" size={17} /></span><span><small>Pacientes en el directorio</small><strong>{pacientes.length}</strong></span></article><article className="resumen-modulo-card"><span className="resumen-icono"><Icono name="check" size={17} /></span><span><small>Pacientes activos</small><strong>{pacientes.filter((paciente) => paciente.status === 'Activo').length}</strong></span></article><article className="resumen-modulo-card"><span className="resumen-icono"><Icono name="clock" size={17} /></span><span><small>Pendientes de seguimiento</small><strong>{pacientes.filter((paciente) => paciente.status === 'Pendiente').length}</strong></span></article></section>
      <section className="tarjeta-contenido">
        <div className="barra-pacientes">
          <div className="pestanas-pacientes"><button className={`pestana-paciente ${filtroEstado === 'Todos' ? 'seleccionado' : ''}`} onClick={() => establecerFiltroEstado('Todos')} type="button">Todos <b>{pacientes.length}</b></button><button className={`pestana-paciente ${filtroEstado === 'Activo' ? 'seleccionado' : ''}`} onClick={() => establecerFiltroEstado('Activo')} type="button">Activos <b>{pacientes.filter((p) => p.status === 'Activo').length}</b></button><button className={`pestana-paciente ${filtroEstado === 'Pendiente' ? 'seleccionado' : ''}`} onClick={() => establecerFiltroEstado('Pendiente')} type="button">Pendientes <b>{pacientes.filter((p) => p.status === 'Pendiente').length}</b></button></div>
          <label className="busqueda-pacientes"><Icono name="search" size={15} /><input value={busqueda} onChange={(evento) => { const valor = evento.target.value; valor ? setParams({ search: valor }) : setParams({}) }} placeholder="Buscar por nombre, correo, expediente o NSS…" aria-label="Buscar paciente" /></label>
        </div>
        <div className="desplazamiento-tabla"><table className="tabla-datos tabla-pacientes"><thead><tr><th>Expediente</th><th>Paciente</th><th>Edad</th><th>Sexo</th><th>Sangre</th><th>Seguro</th><th>Teléfono</th><th>Última visita</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
          {pacientesVisibles.map((paciente) => <tr key={paciente.id}><td>{paciente.expediente ?? paciente.id}</td><td><span className="celda-paciente"><span className="avatar-paciente">{iniciales(paciente.name)}</span><span><strong>{paciente.name}</strong><small>{paciente.email}</small></span></span></td><td>{paciente.age || '—'}</td><td>{paciente.sex === 'F' ? 'Femenino' : paciente.sex === 'M' ? 'Masculino' : paciente.sex || '—'}</td><td>{paciente.bloodType || '—'}</td><td>{paciente.insurance || '—'}</td><td>{paciente.phone}</td><td>{paciente.lastVisit}</td><td><EtiquetaEstado estado={paciente.status} className={paciente.status === 'Pendiente' ? 'estado-pendiente' : ''} /></td><td><div className="acciones-tabla"><button type="button" onClick={() => establecerModal({ tipo: 'detalle', paciente })}><Icono name="eye" size={14} />Ver</button><button type="button" onClick={() => abrirFormulario(paciente)}><Icono name="edit" size={14} />Editar</button></div></td></tr>)}
        </tbody></table></div>
        {!pacientesVisibles.length && <div className="estado-vacio"><strong>No encontramos pacientes</strong><span>Cambia la búsqueda o el filtro seleccionado.</span></div>}
      </section>

      {modal?.tipo === 'detalle' && <ModalFormulario titulo={modal.paciente.name} descripcion={`Expediente · ${modal.paciente.expediente ?? modal.paciente.id}`} alCerrar={() => establecerModal(null)} pie={<button className="boton-secundario" type="button" onClick={() => abrirFormulario(modal.paciente)}>Editar ficha</button>}><div className="ficha-datos-grid"><div className="dato-ficha"><span>Sexo</span><strong>{modal.paciente.sex === 'F' ? 'Femenino' : modal.paciente.sex === 'M' ? 'Masculino' : modal.paciente.sex || 'Sin especificar'}</strong></div><div className="dato-ficha"><span>Edad</span><strong>{modal.paciente.age ? `${modal.paciente.age} años` : 'No indicada'}</strong></div><div className="dato-ficha"><span>Fecha de nacimiento</span><strong>{modal.paciente.dateOfBirth || 'Sin registro'}</strong></div><div className="dato-ficha"><span>Estado civil</span><strong>{modal.paciente.maritalStatus || 'Sin registro'}</strong></div><div className="dato-ficha"><span>Ocupación</span><strong>{modal.paciente.occupation || 'Sin registro'}</strong></div><div className="dato-ficha"><span>Tipo de sangre</span><strong>{modal.paciente.bloodType || 'Sin registro'}</strong></div><div className="dato-ficha ancho-completo"><span>Domicilio</span><strong>{modal.paciente.address || 'Sin registro'}</strong></div><div className="dato-ficha"><span>Correo</span><strong>{modal.paciente.email}</strong></div><div className="dato-ficha"><span>Teléfono</span><strong>{modal.paciente.phone}</strong></div><div className="dato-ficha ancho-completo dato-destacado"><span>Contacto de emergencia</span><strong>{modal.paciente.emergencyContact || 'Sin registro'} · {modal.paciente.emergencyPhone || 'Sin teléfono'}</strong></div><div className="dato-ficha"><span>Seguro médico</span><strong>{modal.paciente.insurance || 'Sin registro'}</strong></div><div className="dato-ficha"><span>NSS</span><strong>{modal.paciente.nss || 'Sin registro'}</strong></div><div className="dato-ficha"><span>Última visita</span><strong>{modal.paciente.lastVisit}</strong></div><div className="dato-ficha"><span>Estado</span><strong>{modal.paciente.status}</strong></div></div></ModalFormulario>}

      {(modal?.tipo === 'nuevo' || modal?.tipo === 'editar') && <ModalFormulario titulo={modal.tipo === 'nuevo' ? 'Registrar paciente' : 'Editar paciente'} descripcion="Información de contacto del paciente." alCerrar={() => establecerModal(null)}><form className="formulario-modulo" onSubmit={guardarPaciente} noValidate>
        <fieldset className="grupo-campos-clinicos"><legend>Datos personales</legend><div className="campos-dos-columnas"><label>Nombre completo<input name="name" defaultValue={formulario.name} autoFocus />{errores.name && <small className="error-campo">{errores.name}</small>}</label><label>Correo electrónico<input name="email" type="email" defaultValue={formulario.email} />{errores.email && <small className="error-campo">{errores.email}</small>}</label><label>Teléfono<input name="phone" defaultValue={formulario.phone} />{errores.phone && <small className="error-campo">{errores.phone}</small>}</label><label>Fecha de nacimiento<input name="dateOfBirth" type="date" defaultValue={formulario.dateOfBirth} /></label><label>Edad<input name="age" type="number" min="0" max="120" defaultValue={formulario.age} /></label><label>Sexo<select name="sex" defaultValue={formulario.sex}><option value="">Sin especificar</option><option value="F">Femenino</option><option value="M">Masculino</option><option value="Otro">Otro</option></select></label><label>Estado civil<input name="maritalStatus" defaultValue={formulario.maritalStatus} /></label><label>Ocupación<input name="occupation" defaultValue={formulario.occupation} /></label><label className="ancho-completo">Domicilio<input name="address" defaultValue={formulario.address} /></label><label>Tipo de sangre<select name="bloodType" defaultValue={formulario.bloodType}><option value="">Sin especificar</option>{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((tipo) => <option key={tipo}>{tipo}</option>)}</select></label><label>Seguro médico<input name="insurance" defaultValue={formulario.insurance} /></label><label>NSS<input name="nss" defaultValue={formulario.nss} /></label><label>Estado<select name="status" defaultValue={formulario.status}><option>Activo</option><option>Pendiente</option><option>Inactivo</option></select></label></div></fieldset><fieldset className="grupo-campos-clinicos"><legend>Contacto de emergencia</legend><div className="campos-dos-columnas"><label>Nombre del contacto<input name="emergencyContact" defaultValue={formulario.emergencyContact} /></label><label>Teléfono del contacto<input name="emergencyPhone" defaultValue={formulario.emergencyPhone} /></label></div></fieldset>
        <div className="modal-pie interno"><button className="boton-secundario" type="button" onClick={() => establecerModal(null)}>Cancelar</button><button className="accion-principal" type="submit">{modal.tipo === 'nuevo' ? 'Agregar paciente' : 'Guardar cambios'}</button></div>
      </form></ModalFormulario>}
    </div>
  )
}
