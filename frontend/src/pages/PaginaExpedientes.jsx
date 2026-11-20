import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import Icono from '../components/Icono.jsx'
import ModalFormulario from '../components/ModalFormulario.jsx'
import { useDatosDemostracion } from '../context/useDatosDemostracion.js'
import { obtenerFechaLocal } from '../utilidades/fechas.js'
import { normalizarDatosFormulario } from '../utilidades/validacionesFormulario.js'

const expedienteVacio = { antecedentes: 'Sin antecedentes registrados.', alergias: 'No conocidas', padecimientos: 'Sin padecimientos crónicos registrados', medicamentos: 'Sin medicamentos de uso continuo', cirugias: 'Sin antecedentes quirúrgicos registrados', antecedentesFamiliares: 'Sin antecedentes familiares relevantes', entradas: [] }

function fechaLegible(fecha) {
  if (!fecha) return 'Sin registro'
  return new Date(`${fecha}T12:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function PaginaExpedientes() {
  const { user } = useOutletContext()
  const { pacientes, expedientes, establecerExpedientes, medicos } = useDatosDemostracion()
  const [busqueda, establecerBusqueda] = useState('')
  const [pacienteActivo, establecerPacienteActivo] = useState(null)
  const [modal, establecerModal] = useState(false)
  const [errores, establecerErrores] = useState({})
  const pacientesVisibles = pacientes.filter((paciente) => `${paciente.name} ${paciente.id} ${paciente.expediente ?? ''} ${paciente.nss ?? ''}`.toLowerCase().includes(busqueda.toLowerCase()) && (user?.role !== 'PATIENT' || paciente.id === (user.patientId ?? 'P-001')) && (user?.role !== 'DOCTOR' || ['P-001', 'P-002', 'P-003'].includes(paciente.id)))
  const expedienteActivo = expedientes.find((item) => item.patientId === pacienteActivo?.id) ?? expedienteVacio

  function validarCampo(nombre, valor) {
    const texto = String(valor ?? '').trim()
    if (['motivo', 'diagnostico', 'doctorId', 'tratamiento'].includes(nombre) && !texto) return 'Completa este campo.'
    const limites = { pulso: [30, 220], temperatura: [30, 45], peso: [1, 350], estatura: [0.3, 2.5] }
    if (texto && limites[nombre]) {
      const [minimo, maximo] = limites[nombre]
      if (!Number.isFinite(Number(texto)) || Number(texto) < minimo || Number(texto) > maximo) return `El valor debe estar entre ${minimo} y ${maximo}.`
    }
    return ''
  }

  function agregarEntrada(evento) {
    evento.preventDefault()
    const datos = normalizarDatosFormulario(evento.currentTarget)
    const erroresValidacion = Object.fromEntries(['motivo', 'diagnostico', 'doctorId', 'tratamiento', 'pulso', 'temperatura', 'peso', 'estatura'].map((campo) => [campo, validarCampo(campo, datos[campo])]).filter(([, error]) => error))
    establecerErrores(erroresValidacion)
    if (Object.keys(erroresValidacion).length) return
    const nuevaEntrada = { ...datos, id: `E-${pacienteActivo.id}-${expedienteActivo.entradas.length + 1}`, fecha: obtenerFechaLocal() }
    establecerExpedientes((actuales) => actuales.some((item) => item.patientId === pacienteActivo.id)
      ? actuales.map((item) => item.patientId === pacienteActivo.id ? { ...item, entradas: [nuevaEntrada, ...item.entradas] } : item)
      : [{ patientId: pacienteActivo.id, ...expedienteVacio, entradas: [nuevaEntrada] }, ...actuales])
    establecerModal(false)
  }

  function guardarResumen(evento) {
    evento.preventDefault()
    const datos = normalizarDatosFormulario(evento.currentTarget)
    establecerExpedientes((actuales) => actuales.some((item) => item.patientId === pacienteActivo.id)
      ? actuales.map((item) => item.patientId === pacienteActivo.id ? { ...item, ...datos } : item)
      : [{ patientId: pacienteActivo.id, ...expedienteVacio, ...datos }, ...actuales])
    establecerModal(false)
  }

  function gestionarCambio(evento) {
    const { name, value } = evento.target
    establecerErrores((actuales) => ({ ...actuales, [name]: validarCampo(name, value) }))
  }

  const datosPersonales = pacienteActivo ? [
    ['Nombre completo', pacienteActivo.name],
    ['Sexo', pacienteActivo.sex === 'F' ? 'Femenino' : pacienteActivo.sex === 'M' ? 'Masculino' : pacienteActivo.sex || 'Sin especificar'],
    ['Edad', pacienteActivo.age ? `${pacienteActivo.age} años` : 'Sin registro'],
    ['Fecha de nacimiento', fechaLegible(pacienteActivo.dateOfBirth)],
    ['Domicilio', pacienteActivo.address || 'Sin registro', 'ancho-completo'],
    ['Estado civil', pacienteActivo.maritalStatus || 'Sin registro'],
    ['Ocupación', pacienteActivo.occupation || 'Sin registro'],
    ['Teléfono de contacto', pacienteActivo.phone || 'Sin registro'],
    ['Tipo de sangre', pacienteActivo.bloodType || 'Sin registro', 'dato-destacado'],
    ['Contacto de emergencia', `${pacienteActivo.emergencyContact || 'Sin registro'}${pacienteActivo.emergencyPhone ? ` · ${pacienteActivo.emergencyPhone}` : ''}`, 'ancho-completo dato-destacado'],
    ['Seguro médico', pacienteActivo.insurance || 'Sin registro'],
    ['NSS', pacienteActivo.nss || 'Sin registro'],
  ] : []

  return <div className="pila-pagina pagina-expedientes">
    <div className="encabezado-pagina"><div><h1>{user?.role === 'PATIENT' ? 'Mi expediente clínico' : 'Expedientes clínicos'}</h1><p>Información personal, antecedentes y seguimiento de atención.</p></div></div>
    {!pacienteActivo ? <section className="tarjeta-contenido"><div className="barra-modulo"><label className="busqueda-pacientes"><Icono name="search" size={17} /><input aria-label="Buscar paciente" placeholder="Buscar por nombre, expediente o NSS…" value={busqueda} onChange={(evento) => establecerBusqueda(evento.target.value)} /></label><span className="texto-secundario">{pacientesVisibles.length} expedientes</span></div><div className="lista-expedientes">{pacientesVisibles.map((paciente) => { const expediente = expedientes.find((item) => item.patientId === paciente.id); return <button className="fila-expediente" type="button" key={paciente.id} onClick={() => establecerPacienteActivo(paciente)}><span className="avatar-paciente">{paciente.name.slice(0, 1)}</span><span className="datos-fila-expediente"><strong>{paciente.name}</strong><small>{paciente.expediente ?? paciente.id} · {expediente?.entradas.length ?? 0} consultas registradas</small></span><span className="ultima-visita">Última visita: {fechaLegible(expediente?.entradas[0]?.fecha)}</span><span className="flecha-detalle">›</span></button> })}{!pacientesVisibles.length && <div className="estado-vacio">No hay expedientes que coincidan con la búsqueda.</div>}</div></section> : <div className="pila-pagina detalle-expediente">
      <button className="enlace-volver" type="button" onClick={() => establecerPacienteActivo(null)}>← Volver al listado</button>
      <section className="tarjeta-perfil-paciente encabezado-expediente"><span className="avatar-paciente-grande">{pacienteActivo.name.slice(0, 1)}</span><div><span className="id-paciente">EXPEDIENTE · {pacienteActivo.expediente ?? pacienteActivo.id}</span><h2>{pacienteActivo.name}</h2><p>{pacienteActivo.age ? `${pacienteActivo.age} años` : 'Edad sin registrar'} · {pacienteActivo.email}</p></div>{user?.role !== 'PATIENT' && <button className="accion-principal" type="button" onClick={() => establecerModal('consulta')}><Icono name="records" size={16} /> Añadir consulta</button>}</section>
      <section className="tarjeta-contenido ficha-personal-expediente"><div className="encabezado-seccion"><div className="encabezado-seccion-icono"><span className="icono-seccion-lavanda"><Icono name="profile" size={17} /></span><div><h2>Datos personales</h2><p>Información de contacto y afiliación</p></div></div></div><div className="ficha-datos-grid">{datosPersonales.map(([titulo, valor, clase = '']) => <div className={`dato-ficha ${clase}`} key={titulo}><span>{titulo}</span><strong>{valor}</strong></div>)}</div></section>
      <section className="tarjeta-contenido"><div className="encabezado-seccion"><div className="encabezado-seccion-icono"><span className="icono-seccion-cielo"><Icono name="corazon" size={17} /></span><div><h2>Resumen clínico</h2><p>Antecedentes y datos importantes de salud</p></div></div>{user?.role !== 'PATIENT' && <button className="boton-secundario" type="button" onClick={() => establecerModal('resumen')}>Editar resumen</button>}</div><div className="resumen-medico-grid"><article><span className="resumen-medico-icono alergia"><Icono name="destellos" size={17} /></span><div><small>Alergias</small><strong>{expedienteActivo.alergias}</strong></div></article><article><span className="resumen-medico-icono padecimiento"><Icono name="corazon" size={17} /></span><div><small>Padecimientos</small><strong>{expedienteActivo.padecimientos}</strong></div></article><article><span className="resumen-medico-icono medicamento"><Icono name="records" size={17} /></span><div><small>Medicamentos actuales</small><strong>{expedienteActivo.medicamentos}</strong></div></article><article><span className="resumen-medico-icono familiar"><Icono name="patients" size={17} /></span><div><small>Antecedentes familiares</small><strong>{expedienteActivo.antecedentesFamiliares}</strong></div></article><article className="ancho-completo"><span className="resumen-medico-icono cirugia"><Icono name="records" size={17} /></span><div><small>Antecedentes quirúrgicos</small><strong>{expedienteActivo.cirugias}</strong></div></article></div><p className="texto-antecedentes">{expedienteActivo.antecedentes}</p></section>
      <section className="tarjeta-contenido"><div className="encabezado-seccion"><div className="encabezado-seccion-icono"><span className="icono-seccion-cielo"><Icono name="clock" size={17} /></span><div><h2>Consultas y evolución</h2><p>Notas clínicas, tratamientos y signos vitales</p></div></div><span className="conteo-seccion">{expedienteActivo.entradas.length}</span></div><div className="linea-tiempo">{expedienteActivo.entradas.map((entrada) => <article className="entrada-clinica" key={entrada.id}><span className="punto-linea-tiempo" /><div className="entrada-clinica-cabecera"><div><time>{fechaLegible(entrada.fecha)}</time><h3>{entrada.motivo || entrada.diagnostico}</h3></div><span className="profesional-nota">{medicos.find((medico) => medico.id === entrada.doctorId)?.name ?? 'Equipo médico'}</span></div><div className="diagnostico-nota"><small>Diagnóstico</small><strong>{entrada.diagnostico}</strong></div><div className="signos-vitales-grid">{[['Presión arterial', entrada.presion, 'mmHg'], ['Pulso', entrada.pulso, 'lpm'], ['Temperatura', entrada.temperatura, '°C'], ['Peso', entrada.peso, 'kg'], ['Estatura', entrada.estatura, 'm']].filter(([, valor]) => valor).map(([titulo, valor, unidad]) => <div key={titulo}><small>{titulo}</small><strong>{valor} <span>{unidad}</span></strong></div>)}</div><div className="rejilla-detalle"><div><span>Tratamiento</span><strong>{entrada.tratamiento || 'Sin indicaciones adicionales'}</strong></div><div><span>Medicamentos</span><strong>{entrada.medicamentos || 'Sin receta nueva'}</strong></div><div><span>Estudios solicitados</span><strong>{entrada.estudios || 'Sin estudios adicionales'}</strong></div><div><span>Próxima revisión</span><strong>{fechaLegible(entrada.proximaRevision)}</strong></div><div className="ancho-completo"><span>Observaciones</span><strong>{entrada.observaciones || 'Sin observaciones adicionales'}</strong></div></div></article>)}{!expedienteActivo.entradas.length && <div className="estado-vacio">Aún no hay consultas registradas.</div>}</div></section>
    </div>}
    {modal === 'consulta' && <ModalFormulario titulo="Registrar consulta" descripcion={`Nueva nota clínica para ${pacienteActivo?.name}.`} alCerrar={() => establecerModal(false)}><form className="formulario-modulo" noValidate onSubmit={agregarEntrada}><div className="campos-dos-columnas"><label className="ancho-completo">Motivo de consulta<input name="motivo" onChange={gestionarCambio} aria-invalid={Boolean(errores.motivo)} />{errores.motivo && <small className="error-campo">{errores.motivo}</small>}</label><label>Diagnóstico<input name="diagnostico" onChange={gestionarCambio} aria-invalid={Boolean(errores.diagnostico)} />{errores.diagnostico && <small className="error-campo">{errores.diagnostico}</small>}</label><label>Profesional<select name="doctorId" defaultValue={user?.doctorId ?? medicos[0]?.id} onChange={gestionarCambio} aria-invalid={Boolean(errores.doctorId)}><option value="">Selecciona al profesional</option>{medicos.filter((medico) => medico.status === 'Activo').map((medico) => <option key={medico.id} value={medico.id}>{medico.name} · {medico.specialty}</option>)}</select>{errores.doctorId && <small className="error-campo">{errores.doctorId}</small>}</label><label className="ancho-completo">Tratamiento e indicaciones<textarea name="tratamiento" rows="3" onChange={gestionarCambio} aria-invalid={Boolean(errores.tratamiento)} />{errores.tratamiento && <small className="error-campo">{errores.tratamiento}</small>}</label><label className="ancho-completo">Medicamentos recetados<textarea name="medicamentos" rows="2" placeholder="Nombre, dosis y frecuencia" /></label><label>Estudios solicitados<input name="estudios" placeholder="Laboratorio o imagenología" /></label><label>Próxima revisión<input name="proximaRevision" type="date" /></label></div><fieldset className="grupo-signos-vitales"><legend>Signos vitales</legend><div className="campos-dos-columnas"><label>Presión arterial<input name="presion" placeholder="120/80" /></label><label>Pulso (lpm)<input name="pulso" type="number" min="30" max="220" onChange={gestionarCambio} aria-invalid={Boolean(errores.pulso)} />{errores.pulso && <small className="error-campo">{errores.pulso}</small>}</label><label>Temperatura (°C)<input name="temperatura" type="number" min="30" max="45" step="0.1" onChange={gestionarCambio} aria-invalid={Boolean(errores.temperatura)} />{errores.temperatura && <small className="error-campo">{errores.temperatura}</small>}</label><label>Peso (kg)<input name="peso" type="number" min="1" max="350" step="0.1" onChange={gestionarCambio} aria-invalid={Boolean(errores.peso)} />{errores.peso && <small className="error-campo">{errores.peso}</small>}</label><label>Estatura (m)<input name="estatura" type="number" min="0.3" max="2.5" step="0.01" onChange={gestionarCambio} aria-invalid={Boolean(errores.estatura)} />{errores.estatura && <small className="error-campo">{errores.estatura}</small>}</label></div></fieldset><label>Observaciones<textarea name="observaciones" rows="3" /></label><div className="modal-pie interno"><button className="boton-secundario" type="button" onClick={() => establecerModal(false)}>Cancelar</button><button className="accion-principal" type="submit">Guardar consulta</button></div></form></ModalFormulario>}
    {modal === 'resumen' && <ModalFormulario titulo="Editar resumen clínico" descripcion={`Antecedentes médicos de ${pacienteActivo?.name}.`} alCerrar={() => establecerModal(false)}><form className="formulario-modulo" onSubmit={guardarResumen}><label>Antecedentes<textarea name="antecedentes" rows="3" defaultValue={expedienteActivo.antecedentes} /></label><label>Alergias<textarea name="alergias" rows="2" defaultValue={expedienteActivo.alergias} /></label><label>Padecimientos crónicos<textarea name="padecimientos" rows="2" defaultValue={expedienteActivo.padecimientos} /></label><label>Medicamentos de uso continuo<textarea name="medicamentos" rows="2" defaultValue={expedienteActivo.medicamentos} /></label><label>Antecedentes quirúrgicos<textarea name="cirugias" rows="2" defaultValue={expedienteActivo.cirugias} /></label><label>Antecedentes familiares<textarea name="antecedentesFamiliares" rows="2" defaultValue={expedienteActivo.antecedentesFamiliares} /></label><div className="modal-pie interno"><button className="boton-secundario" type="button" onClick={() => establecerModal(false)}>Cancelar</button><button className="accion-principal" type="submit">Guardar antecedentes</button></div></form></ModalFormulario>}
  </div>
}
