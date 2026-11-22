import { useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import Icono from '../components/Icono.jsx'
import EtiquetaEstado from '../components/EtiquetaEstado.jsx'
import { useDatosDemostracion } from '../context/useDatosDemostracion.js'
import { obtenerFechaLocal } from '../utilidades/fechas.js'
import axiosClient from '../config/axiosClient'

const fechaActual = obtenerFechaLocal()
const fechaBonita = (fecha, opciones = { weekday: 'long', day: 'numeric', month: 'long' }) => new Date(`${fecha}T12:00:00`).toLocaleDateString('es-MX', opciones)

function obtenerMomentoDelDia() {
  const hora = new Date().getHours()
  if (hora < 12) return { saludo: '¡Buenos días!', nombre: 'la mañana', icono: 'sol', etiqueta: 'Jornada matutina' }
  if (hora < 19) return { saludo: '¡Buenas tardes!', nombre: 'la tarde', icono: 'sol', etiqueta: 'Jornada vespertina' }
  return { saludo: '¡Buenas noches!', nombre: 'la noche', icono: 'luna', etiqueta: 'Jornada nocturna' }
}

function TarjetaIndicador({ titulo, valor, icono, enlace, acento = false }) {
  return <Link className={`tarjeta-panel ${acento ? 'tarjeta-panel-acento' : ''}`} to={enlace}><span className="icono-panel"><Icono name={icono} size={19} /></span><span className="texto-panel"><small>{titulo}</small><strong>{valor}</strong></span><span className="flecha-panel">↗</span></Link>
}

function AccesoRapido({ href, icono, titulo, texto }) {
  return <Link className="acceso-rapido" to={href}><span className="icono-acceso"><Icono name={icono} size={18} /></span><span><strong>{titulo}</strong><small>{texto}</small></span><span className="flecha-acceso">→</span></Link>
}

function EstadoCita({ estado }) {
  const clase = estado === 'Pendiente' ? 'estado-pendiente' : estado === 'Cancelada' ? 'estado-cancelada' : estado === 'Completada' ? 'estado-completada' : 'estado-confirmado'
  return <EtiquetaEstado estado={estado} className={clase} />
}

export default function PaginaPanel() {
  const { user, rutaBase, modoDemostracion } = useOutletContext()
  const { pacientes: pacientesDemo, citas: citasDemo, medicos: medicosDemo, usuarios, expedientes } = useDatosDemostracion()
  const momento = obtenerMomentoDelDia()
  const rol = user?.role
  const nombre = rol === 'ADMIN' ? 'Administración' : user?.name ?? 'Usuario'
  const rolPaciente = rol === 'PATIENT'

  const esModoReal = modoDemostracion === false
  const usaApi = esModoReal && rol === 'ADMIN'
  const [resumen, setResumen] = useState(null)
  const [cargandoResumen, setCargandoResumen] = useState(usaApi)
  const [errorResumen, setErrorResumen] = useState('')
  const [citasReales, setCitasReales] = useState([])
  const [medicosReales, setMedicosReales] = useState([])
  const [pacientesReales, setPacientesReales] = useState([])

  useEffect(() => {
    if (!esModoReal) return undefined
    let cancelado = false

    async function cargarDatosPanel() {
      if (usaApi) {
        setCargandoResumen(true)
        setErrorResumen('')
        try {
          const { data } = await axiosClient.get('/dashboard/resumen')
          if (!cancelado) setResumen(data)
        } catch (error) {
          if (!cancelado) {
            setErrorResumen(
              error.response
                ? 'No se pudo cargar el resumen del panel.'
                : 'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.'
            )
          }
        } finally {
          if (!cancelado) setCargandoResumen(false)
        }
      }

      // Cargar citas reales para médico y paciente
      try {
        const [resCitas, resMed, resPac] = await Promise.all([
          axiosClient.get('/citas', { params: { size: 50 } }).catch(() => ({ data: { content: [] } })),
          axiosClient.get('/medicos', { params: { size: 50 } }).catch(() => ({ data: { content: [] } })),
          axiosClient.get('/pacientes', { params: { size: 50 } }).catch(() => ({ data: { content: [] } }))
        ])

        if (!cancelado) {
          const mapeadas = (resCitas.data?.content || []).map((c) => {
            const fechaHora = c.fechaHora ? String(c.fechaHora) : ''
            return {
              id: c.id,
              patientId: c.pacienteId,
              patientName: c.pacienteNombre,
              doctorId: c.medicoId,
              doctorName: c.medicoNombre,
              date: fechaHora.slice(0, 10),
              time: fechaHora.length >= 16 ? fechaHora.slice(11, 16) : '09:00',
              type: c.tipoConsulta || 'Consulta general',
              reason: c.motivo || '',
              duration: String(c.duracion || 30),
              modality: c.modalidad || 'Presencial',
              location: c.ubicacion || 'Consultorio 1',
              status: c.estado === 'PENDIENTE' ? 'Pendiente' : c.estado === 'CONFIRMADA' ? 'Confirmada' : c.estado === 'COMPLETADA' ? 'Completada' : 'Cancelada'
            }
          })
          setCitasReales(mapeadas)
          setMedicosReales((resMed.data?.content || []).map((m) => ({ id: m.id, name: m.nombreCompleto })))
          setPacientesReales((resPac.data?.content || []).map((p) => ({ id: p.id, name: p.nombreCompleto })))
        }
      } catch (err) {
        console.error('Error al cargar datos reales del panel:', err)
      }
    }

    cargarDatosPanel()
    return () => { cancelado = true }
  }, [esModoReal, usaApi])

  const citas = esModoReal ? citasReales : citasDemo
  const pacientes = esModoReal ? pacientesReales : pacientesDemo
  const medicos = esModoReal ? medicosReales : medicosDemo

  const citasDeHoy = citas.filter((cita) => cita.date === fechaActual && cita.status !== 'Cancelada')
  const citasPropias = citas.filter(
    (cita) =>
      (!rolPaciente || String(cita.patientId) === String(user?.patientId ?? '')) &&
      (rol !== 'DOCTOR' || String(cita.doctorId) === String(user?.doctorId ?? '')) &&
      cita.status !== 'Cancelada'
  )
  const proximasCitas = citasPropias
    .filter((cita) => cita.date >= fechaActual)
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .slice(0, 4)

  const valorApi = (valor) => (cargandoResumen ? '…' : (valor ?? '—'))

  if (rol === 'DOCTOR') {
    return <div className="panel-rol panel-medico">
      <section className="bienvenida-rol bienvenida-medico"><div className="bienvenida-copia"><span className="saludo-momento">{momento.saludo}</span><h1>{nombre}</h1><p>Tu jornada clínica está lista. Aquí tienes tu agenda y pacientes para hoy.</p><span className="etiqueta-jornada"><Icono name={momento.icono} size={16} />{momento.etiqueta} · {fechaBonita(fechaActual)}</span></div><div className={`ilustracion-momento ${momento.icono}`}><Icono name={momento.icono} size={53} /><Icono name="destellos" size={20} /></div></section>
      <section className="rejilla-panel tres-columnas"><TarjetaIndicador titulo="Citas de hoy" valor={citasDeHoy.filter((cita) => cita.doctorId === (user?.doctorId ?? 'M-001')).length} icono="appointments" enlace={`${rutaBase}/citas`} acento /><TarjetaIndicador titulo="Pacientes asignados" valor="3" icono="patients" enlace={`${rutaBase}/pacientes`} /><TarjetaIndicador titulo="Expedientes disponibles" valor={expedientes.length} icono="records" enlace={`${rutaBase}/expedientes`} /></section>
      <div className="columnas-panel"><section className="seccion-panel citas-panel"><header className="cabecera-panel"><div><span className="sobrelinea-panel">AGENDA PERSONAL</span><h2>Próximas consultas</h2><p>Organiza tu día de atención.</p></div><Link to={`${rutaBase}/citas`}>Ver agenda <span>→</span></Link></header>{proximasCitas.length ? <div className="lista-citas-panel">{proximasCitas.map((cita) => <article className="tarjeta-cita-panel" key={cita.id}><div className="bloque-hora-cita"><strong>{cita.time}</strong><small>{fechaBonita(cita.date, { weekday: 'short', day: 'numeric', month: 'short' })}</small></div><span className="avatar-paciente">{(pacientes.find((paciente) => paciente.id === cita.patientId)?.name ?? 'P').slice(0, 1)}</span><div className="datos-cita-panel"><strong>{pacientes.find((paciente) => paciente.id === cita.patientId)?.name ?? 'Paciente'}</strong><small>{cita.reason}</small><span className="detalle-cita-panel">{cita.type || 'Consulta general'} · {cita.location || 'Por asignar'}</span></div><EstadoCita estado={cita.status} /></article>)}</div> : <div className="vacio-panel"><span className="ilustracion-vacia"><Icono name="calendar" size={25} /></span><strong>Tu agenda está despejada</strong><span>Cuando tengas citas, aparecerán aquí.</span></div>}</section><aside className="columna-lateral-panel"><section className="tarjeta-jornada"><div className="jornada-decoracion"><Icono name={momento.icono} size={27} /></div><span className="sobrelinea-panel">TU TURNO</span><h2>{momento.etiqueta}</h2><p>Consulta tu calendario y prepara la atención de tus pacientes.</p><Link to={`${rutaBase}/citas`}>Abrir agenda <span>→</span></Link></section><section className="atajos-panel"><h2>Accesos rápidos</h2><AccesoRapido href={`${rutaBase}/pacientes`} icono="patients" titulo="Pacientes" texto="Ver asignaciones" /><AccesoRapido href={`${rutaBase}/expedientes`} icono="records" titulo="Expedientes" texto="Consultar historial" /></section></aside></div>
    </div>
  }

  if (rolPaciente) {
    const proximaCita = proximasCitas[0]
    const medico = medicos.find((item) => item.id === proximaCita?.doctorId)
    return <div className="panel-rol panel-paciente">
      <section className="bienvenida-rol bienvenida-paciente"><div className="bienvenida-copia"><span className="saludo-momento">{momento.saludo}</span><h1 className="saludo-paciente-titulo">Hola, {nombre}<Icono name="corazon" size={17} /></h1><p>Qué bueno tenerte aquí. Revisa tus citas y la información de tu atención.</p><span className="etiqueta-jornada"><Icono name="corazon" size={16} /> Tu salud, en un solo lugar</span></div></section>
      <section className="tarjeta-cita-destacada"><span className="cita-destacada-icono"><Icono name="calendar" size={23} /></span><div className="cita-destacada-copia"><span className="sobrelinea-panel">TU PRÓXIMA CITA</span>{proximaCita ? <><h2>{fechaBonita(proximaCita.date)}</h2><p>{proximaCita.time} · {medico?.name ?? 'Equipo médico'}</p><small>{proximaCita.type || 'Consulta general'} · {proximaCita.location || 'Consultorio por asignar'}</small><small>{proximaCita.reason}</small></> : <><h2>Aún no tienes una cita próxima</h2><p>Solicita una cita para continuar con tu atención.</p></>}<EstadoCita estado={proximaCita?.status ?? 'Sin citas'} /></div><Link className="boton-cita-destacada" to={`${rutaBase}/mis-citas`}>{proximaCita ? 'Ver mis citas' : 'Agendar cita'} <span>→</span></Link></section>
      <section className="rejilla-panel tres-columnas"><TarjetaIndicador titulo="Citas próximas" valor={proximasCitas.length} icono="appointments" enlace={`${rutaBase}/mis-citas`} acento /><TarjetaIndicador titulo="Citas confirmadas" valor={citasPropias.filter((cita) => cita.status === 'Confirmada').length} icono="check" enlace={`${rutaBase}/mis-citas`} /><TarjetaIndicador titulo="Mi expediente" valor="Disponible" icono="records" enlace={`${rutaBase}/mi-expediente`} /></section>
      <div className="columnas-panel"><section className="atajos-panel tarjeta-atajos-paciente"><header className="cabecera-panel"><div><span className="sobrelinea-panel">PARA TI</span><h2>Accesos rápidos</h2></div></header><AccesoRapido href={`${rutaBase}/mi-expediente`} icono="records" titulo="Mi expediente" texto="Consulta tu historial y notas" /><AccesoRapido href={`${rutaBase}/perfil`} icono="profile" titulo="Mi perfil" texto="Actualiza tus datos de contacto" /></section><aside className="recordatorio-panel"><div className="recordatorio-icono"><Icono name={proximaCita ? 'bell' : 'destellos'} size={20} /></div><span className="sobrelinea-panel">RECORDATORIO</span><h2>{proximaCita ? 'No olvides tu próxima consulta' : 'Sigue cuidando de ti'}</h2><p>{proximaCita ? `Tienes una cita ${proximaCita.date === fechaActual ? 'hoy' : `el ${fechaBonita(proximaCita.date, { day: 'numeric', month: 'long' })}`} a las ${proximaCita.time}.` : 'Cuando agendes una cita, te mostraremos aquí el recordatorio.'}</p><Link to={`${rutaBase}/mis-citas`}>Ir a mis citas →</Link></aside></div>
    </div>
  }

  const estados = ['Confirmada', 'Pendiente', 'Completada', 'Cancelada'].map((estado) => ({ estado, total: usaApi ? (resumen?.citasPorEstado?.[estado.toUpperCase()] ?? 0) : citas.filter((cita) => cita.status === estado).length }))
  const totalEstados = Math.max(estados.reduce((total, item) => total + item.total, 0), 1)
  const porcentajeConfirmadas = (estados[0].total / totalEstados) * 100
  const porcentajePendientes = (estados[1].total / totalEstados) * 100
  const porcentajeCompletadas = (estados[2].total / totalEstados) * 100
  const ESTADOS_API = { PENDIENTE: 'Pendiente', CONFIRMADA: 'Confirmada', COMPLETADA: 'Completada', CANCELADA: 'Cancelada' }
  const actividades = usaApi
    ? (resumen?.actividadReciente ?? []).map((cita) => ({
        id: cita.id,
        status: ESTADOS_API[cita.estado] ?? cita.estado,
        patientName: cita.paciente,
        reason: cita.motivo || 'Sin motivo registrado',
        date: String(cita.fechaHora).slice(0, 10)
      }))
    : [...citas].sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)).slice(0, 3)
  const totalCitas = usaApi ? estados.reduce((total, item) => total + item.total, 0) : citas.length

  return <div className="panel-rol panel-admin">
    <section className="bienvenida-rol bienvenida-admin"><div className="bienvenida-copia"><span className="saludo-momento">{momento.saludo}</span><h1>{nombre}</h1><p>Este es el resumen de actividad y operación de la clínica.</p><span className="etiqueta-jornada"><Icono name="destellos" size={15} /> Panel de administración</span></div><div className={`ilustracion-momento ${momento.icono}`}><Icono name={momento.icono} size={49} /><Icono name="destellos" size={20} /></div></section>
    {usaApi && errorResumen && <p role="alert" style={{ color: '#b42318', margin: '0 0 12px' }}>{errorResumen}</p>}
    <section className="rejilla-panel cuatro-columnas"><TarjetaIndicador titulo="Pacientes activos" valor={usaApi ? valorApi(resumen?.pacientesActivos) : pacientes.filter((paciente) => paciente.status === 'Activo').length} icono="patients" enlace={`${rutaBase}/pacientes`} /><TarjetaIndicador titulo="Citas de hoy" valor={usaApi ? valorApi(resumen?.citasHoy) : citasDeHoy.length} icono="appointments" enlace={`${rutaBase}/citas`} acento /><TarjetaIndicador titulo="Médicos activos" valor={usaApi ? valorApi(resumen?.medicosActivos) : medicos.filter((item) => item.status === 'Activo').length} icono="doctors" enlace={`${rutaBase}/medicos`} /><TarjetaIndicador titulo="Cuentas de usuario" valor={usaApi ? valorApi(resumen?.cuentasUsuario) : usuarios.length} icono="users" enlace={`${rutaBase}/usuarios`} /></section>
    <div className="columnas-panel"><section className="seccion-panel actividad-admin"><header className="cabecera-panel"><div><span className="sobrelinea-panel">ACTUALIZACIONES</span><h2>Actividad reciente</h2><p>Movimientos recientes de la agenda.</p></div><Link to={`${rutaBase}/citas`}>Abrir agenda →</Link></header><div className="lista-actividad">{usaApi && !cargandoResumen && actividades.length === 0 && <p>Aún no hay movimientos en la agenda.</p>}{actividades.map((cita) => { const nombrePaciente = cita.patientName ?? pacientes.find((item) => item.id === cita.patientId)?.name; return <article className="fila-actividad" key={cita.id}><span className="icono-actividad"><Icono name="appointments" size={16} /></span><div><strong>{cita.status === 'Cancelada' ? 'Cita cancelada' : cita.status === 'Confirmada' ? 'Cita confirmada' : 'Cita en agenda'}</strong><small>{nombrePaciente ?? 'Paciente'} · {cita.reason}</small></div><time>{fechaBonita(cita.date, { day: 'numeric', month: 'short' })}</time></article> })}</div></section><aside className="columna-lateral-panel"><section className="tarjeta-estados"><span className="sobrelinea-panel">ESTADO DE LA AGENDA</span><h2>Citas por estado</h2><div className="grafica-estados"><div className="anillo-estados" style={{ '--porcentaje-confirmadas': `${porcentajeConfirmadas}%`, '--porcentaje-pendientes': `${porcentajeConfirmadas + porcentajePendientes}%`, '--porcentaje-completadas': `${porcentajeConfirmadas + porcentajePendientes + porcentajeCompletadas}%` }}><div><strong>{usaApi ? valorApi(totalCitas) : totalCitas}</strong><small>citas</small></div></div><div className="leyenda-estados">{estados.map((item) => <span key={item.estado}><i className={`punto-${item.estado.toLowerCase()}`} />{item.estado}<strong>{item.total}</strong></span>)}</div></div></section><section className="atajos-panel"><h2>Administrar</h2><AccesoRapido href={`${rutaBase}/pacientes`} icono="patients" titulo="Pacientes" texto="Directorio clínico" /><AccesoRapido href={`${rutaBase}/usuarios`} icono="users" titulo="Usuarios" texto="Cuentas y roles" /></section></aside></div>
  </div>
}