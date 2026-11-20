import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import Icono from '../components/Icono.jsx'
import ModalFormulario from '../components/ModalFormulario.jsx'
import { useDatosDemostracion } from '../ContextoDatosDemostracion.jsx'
import { obtenerFechaLocal } from '../utilidades/fechas.js'

const fechaDemostracion = obtenerFechaLocal()

export default function PaginaExpedientes() {
  const { user } = useOutletContext()
  const { pacientes, expedientes, establecerExpedientes } = useDatosDemostracion()
  const [busqueda, establecerBusqueda] = useState('')
  const [pacienteActivo, establecerPacienteActivo] = useState(null)
  const [modal, establecerModal] = useState(false)
  const pacientesVisibles = pacientes.filter((p) => `${p.name} ${p.id}`.toLowerCase().includes(busqueda.toLowerCase()) && (user?.role !== 'PATIENT' || p.id === (user.patientId ?? 'P-001')) && (user?.role !== 'DOCTOR' || ['P-001', 'P-002', 'P-003'].includes(p.id)))
  const expedienteActivo = expedientes.find((item) => item.patientId === pacienteActivo?.id)

  function agregarEntrada(evento) {
    evento.preventDefault()
    const datos = Object.fromEntries(new FormData(evento.currentTarget))
    const nuevaEntrada = { ...datos, id: `E-${pacienteActivo.id}-${expedienteActivo.entradas.length + 1}`, fecha: fechaDemostracion }
    establecerExpedientes((actuales) => actuales.map((expediente) => expediente.patientId === pacienteActivo.id ? { ...expediente, entradas: [nuevaEntrada, ...expediente.entradas] } : expediente))
    establecerModal(false)
  }

  return <div className="pila-pagina">
    <div className="encabezado-pagina"><div><h1>{user?.role === 'PATIENT' ? 'Mi expediente clínico' : 'Expedientes clínicos'}</h1><p>Historial, antecedentes y notas de atención.</p></div></div>
    <p className="nota-datos-demo">Expedientes de ejemplo. No agregues información médica real: los datos no están protegidos ni se envían al servidor.</p>
    {!pacienteActivo ? <section className="tarjeta-contenido"><div className="barra-modulo"><label className="busqueda-pacientes"><Icono name="search" size={15} /><input aria-label="Buscar paciente" placeholder="Buscar expediente…" value={busqueda} onChange={(e) => establecerBusqueda(e.target.value)} /></label><span className="texto-secundario">{pacientesVisibles.length} expedientes</span></div><div className="lista-expedientes">{pacientesVisibles.map((paciente) => { const expediente = expedientes.find((item) => item.patientId === paciente.id); return <button className="fila-expediente" type="button" key={paciente.id} onClick={() => establecerPacienteActivo(paciente)}><span className="avatar-paciente">{paciente.name.slice(0, 1)}</span><span className="datos-fila-expediente"><strong>{paciente.name}</strong><small>{paciente.id} · {expediente?.entradas.length ?? 0} notas clínicas de ejemplo</small></span><span className="ultima-visita">Última nota: {expediente?.entradas[0]?.fecha ?? 'Sin registro'}</span><span className="flecha-detalle">›</span></button> })}</div></section> : <div className="pila-pagina">
      <button className="enlace-volver" type="button" onClick={() => establecerPacienteActivo(null)}>← Volver al listado</button>
      <section className="tarjeta-perfil-paciente"><span className="avatar-paciente-grande">{pacienteActivo.name.slice(0, 1)}</span><div><span className="id-paciente">EXPEDIENTE · {pacienteActivo.id}</span><h2>{pacienteActivo.name}</h2><p>{pacienteActivo.age} años · {pacienteActivo.email}</p></div>{user?.role !== 'PATIENT' && <button className="accion-principal" type="button" onClick={() => establecerModal(true)}>＋ Añadir nota</button>}</section>
      <section className="tarjeta-contenido"><div className="encabezado-seccion"><div className="encabezado-seccion-icono"><span className="icono-seccion-lavanda"><Icono name="records" size={16} /></span><div><h2>Antecedentes</h2><p>Resumen disponible en la demostración</p></div></div></div><p className="texto-antecedentes">{expedienteActivo?.antecedentes ?? 'Sin antecedentes de ejemplo.'}</p></section>
      <section className="tarjeta-contenido"><div className="encabezado-seccion"><div className="encabezado-seccion-icono"><span className="icono-seccion-cielo"><Icono name="clock" size={16} /></span><div><h2>Historial médico</h2><p>Diagnósticos, tratamientos y observaciones</p></div></div><span className="conteo-seccion">{expedienteActivo?.entradas.length ?? 0}</span></div><div className="linea-tiempo">{(expedienteActivo?.entradas ?? []).map((entrada) => <article className="entrada-clinica" key={entrada.id}><span className="punto-linea-tiempo" /><time>{new Date(`${entrada.fecha}T12:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</time><h3>{entrada.diagnostico}</h3><div className="rejilla-detalle"><div><span>Tratamiento</span><strong>{entrada.tratamiento}</strong></div><div><span>Observaciones</span><strong>{entrada.observaciones}</strong></div></div></article>)}{!expedienteActivo?.entradas.length && <div className="estado-vacio">No hay notas de demostración.</div>}</div></section>
    </div>}
    {modal && <ModalFormulario titulo="Añadir nota clínica" descripcion="Escribe únicamente contenido ficticio para la demostración." alCerrar={() => establecerModal(false)}><form className="formulario-modulo" onSubmit={agregarEntrada}><label>Diagnóstico<input name="diagnostico" required /></label><label>Tratamiento<textarea name="tratamiento" rows="3" required /></label><label>Observaciones<textarea name="observaciones" rows="3" required /></label><div className="modal-pie interno"><button className="boton-secundario" type="button" onClick={() => establecerModal(false)}>Cancelar</button><button className="accion-principal" type="submit">Agregar al historial</button></div></form></ModalFormulario>}
  </div>
}
