import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import Icono from '../components/Icono.jsx'
import EtiquetaEstado from '../components/EtiquetaEstado.jsx'
import ModalFormulario from '../components/ModalFormulario.jsx'
import { obtenerFechaLocal } from '../utilidades/fechas.js'
import { normalizarDatosFormulario } from '../utilidades/validacionesFormulario.js'
import axiosClient from '../config/axiosClient'

const hoy = obtenerFechaLocal()
const citaVacia = { patientId: '', doctorId: '', date: hoy, time: '09:00', type: 'Consulta general', reason: '', duration: '30', modality: 'Presencial', location: 'Consultorio 1', status: 'Pendiente' }
const claseEstadoCita = (estado) => ({ Pendiente: 'estado-pendiente', Confirmada: 'estado-confirmado', Completada: 'estado-completada', Cancelada: 'estado-cancelada' })[estado] ?? ''

export default function PaginaCitas() {
  const { user } = useOutletContext()

  const [citas, setCitas] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [medicos, setMedicos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorServidor, setErrorServidor] = useState('')

  const [paginaActual, setPaginaActual] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalElementos, setTotalElementos] = useState(0)

  const [vista, establecerVista] = useState('lista')
  const [fechaFiltro, establecerFechaFiltro] = useState('')
  const [estadoFiltro, establecerEstadoFiltro] = useState('Todos')
  const [medicoFiltro, establecerMedicoFiltro] = useState('Todos')
  const [pacienteFiltro, establecerPacienteFiltro] = useState('Todos')
  const [modal, establecerModal] = useState(null)
  const [formulario, establecerFormulario] = useState(citaVacia)
  const [errores, establecerErrores] = useState({})

  const esPaciente = user?.role === 'PATIENT'

  // Carga catálogos de apoyo (médicos y pacientes)
  useEffect(() => {
    let cancel = false
    const cargarCatalogos = async () => {
      try {
        const resMedicos = await axiosClient.get('/medicos/directorio')
        if (cancel) return
        setMedicos((resMedicos.data || []).map((medico) => ({
          id: medico.id,
          name: medico.nombre,
          specialty: medico.especialidad || '',
          availability: medico.disponibilidad || '',
          status: 'Activo'
        })))

        if (esPaciente) {
          setPacientes([{
            id: user?.patientId,
            name: user?.name || 'Paciente',
            email: user?.email || ''
          }])
        } else {
          const resPacientes = await axiosClient.get('/pacientes', { params: { size: 100 } })
          if (cancel) return
          setPacientes((resPacientes.data?.content || []).map((p) => ({
            id: p.id,
            name: p.nombreCompleto,
            email: p.email,
            phone: p.telefono
          })))
        }
      } catch (err) {
        console.error('Error al cargar catálogos:', err)
      }
    }
    cargarCatalogos()
    return () => { cancel = true }
  }, [esPaciente, user])

  const cargarCitas = useCallback(async (signal) => {
    setCargando(true)
    setErrorServidor('')
    try {
      const params = {
        page: paginaActual,
        size: vista === 'calendario' ? 100 : 10
      }

      if (estadoFiltro !== 'Todos') {
        params.estado = estadoFiltro
      }
      if (fechaFiltro) {
        params.fecha = fechaFiltro
      }
      if (esPaciente && user?.patientId) {
        params.pacienteId = user.patientId
      } else if (pacienteFiltro !== 'Todos' && pacienteFiltro) {
        params.pacienteId = pacienteFiltro
      }

      if (user?.role === 'DOCTOR' && user?.doctorId) {
        params.medicoId = user.doctorId
      } else if (medicoFiltro !== 'Todos' && medicoFiltro) {
        params.medicoId = medicoFiltro
      }

      const resCitas = await axiosClient.get('/citas', { params, signal })
      if (signal?.aborted) return

      const citasMapeadas = (resCitas.data?.content || []).map((c) => {
        const fechaHora = c.fechaHora ? String(c.fechaHora) : ''
        const estadoMayus = (c.estado || 'PENDIENTE').toUpperCase()
        const estadoMap = { PENDIENTE: 'Pendiente', CONFIRMADA: 'Confirmada', COMPLETADA: 'Completada', CANCELADA: 'Cancelada' }
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
          status: estadoMap[estadoMayus] ?? 'Pendiente'
        }
      })

      setCitas(citasMapeadas)
      setTotalPaginas(resCitas.data?.totalPages || 1)
      setTotalElementos(resCitas.data?.totalElements || 0)
    } catch (err) {
      if (signal?.aborted) return
      console.error('Error al cargar citas de la API:', err)
      setErrorServidor(err.response?.data?.mensaje || 'No se pudo conectar con el servidor para cargar las citas.')
    } finally {
      if (!signal?.aborted) setCargando(false)
    }
  }, [paginaActual, vista, estadoFiltro, fechaFiltro, esPaciente, user, pacienteFiltro, medicoFiltro])

  useEffect(() => {
    const controlador = new AbortController()
    Promise.resolve().then(() => {
      if (!controlador.signal.aborted) cargarCitas(controlador.signal)
    })
    return () => controlador.abort()
  }, [cargarCitas])

  const citasVisibles = citas

  function abrirFormulario(cita) {
    const pacientePorDefecto = esPaciente ? (user?.patientId ?? '') : (formulario.patientId || pacientes[0]?.id || '')
    const medicoPorDefecto = formulario.doctorId || medicos[0]?.id || ''
    establecerFormulario(
      cita
        ? { ...cita }
        : {
            ...citaVacia,
            patientId: pacientePorDefecto,
            doctorId: medicoPorDefecto
          }
    )
    establecerErrores({})
    setErrorServidor('')
    establecerModal(cita ? 'editar' : 'nueva')
  }

  function validarCampo(nombre, valor) {
    if (['patientId', 'doctorId', 'date', 'time', 'reason'].includes(nombre) && !String(valor ?? '').trim()) {
      return 'Completa este campo.'
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
    const camposObligatorios = esPaciente
      ? ['doctorId', 'date', 'time', 'reason']
      : ['patientId', 'doctorId', 'date', 'time', 'reason']

    const erroresValidacion = Object.fromEntries(
      camposObligatorios.map((campo) => [campo, validarCampo(campo, datos[campo])]).filter(([, error]) => error)
    )
    establecerErrores(erroresValidacion)
    if (Object.keys(erroresValidacion).length) return

    const payload = {
      pacienteId: Number(datos.patientId || user?.patientId),
      medicoId: Number(datos.doctorId),
      fechaHora: `${datos.date}T${datos.time}:00`,
      tipoConsulta: datos.type || 'Consulta general',
      motivo: datos.reason,
      duracion: Number(datos.duration || 30),
      modalidad: datos.modality || 'Presencial',
      ubicacion: datos.location || 'Consultorio 1'
    }

    try {
      if (modal === 'editar') {
        await axiosClient.put(`/citas/${formulario.id}`, payload)
      } else {
        await axiosClient.post('/citas', payload)
      }
      await cargarCitas()
      establecerModal(null)
    } catch (err) {
      console.error('Error al guardar la cita:', err)
      setErrorServidor(err.response?.data?.mensaje || err.response?.data?.message || 'Error al guardar la cita.')
    }
  }

  async function cambiarEstado(cita, nuevoEstado) {
    try {
      await axiosClient.patch(`/citas/${cita.id}/estado`, {
        estado: nuevoEstado.toUpperCase()
      })
      await cargarCitas()
    } catch (err) {
      console.error('Error al actualizar estado:', err)
      setErrorServidor(err.response?.data?.mensaje || 'Error al actualizar el estado de la cita.')
    }
    establecerModal(null)
  }

  function fechaLegible(fecha) {
    if (!fecha) return 'Sin fecha'
    return new Date(`${fecha}T12:00:00`).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const obtenerNombrePaciente = (id, fallback) => {
    const p = pacientes.find((item) => String(item.id) === String(id))
    return p?.name || fallback || 'Paciente'
  }

  const obtenerNombreMedico = (id, fallback) => {
    const m = medicos.find((item) => String(item.id) === String(id))
    return m?.name || fallback || 'Médico'
  }

  return (
    <div className="pila-pagina">
      <div className="encabezado-pagina">
        <div>
          <h1>{esPaciente ? 'Mis citas' : 'Citas médicas'}</h1>
          <p>Agenda y seguimiento de tus consultas.</p>
        </div>
        <button className="accion-principal" type="button" onClick={() => abrirFormulario()}>
          <span>＋</span> Agendar cita
        </button>
      </div>

      {errorServidor && (
        <div style={{ backgroundColor: '#fef3f2', color: '#b42318', padding: '12px 16px', borderRadius: '8px', border: '1px solid #fecdca' }}>
          {errorServidor}
        </div>
      )}

      <section className="resumen-modulo-grid" aria-label="Resumen de citas">
        <article className="resumen-modulo-card">
          <span className="resumen-icono"><Icono name="calendar" size={17} /></span>
          <span><small>Citas</small><strong>{cargando ? '…' : totalElementos}</strong></span>
        </article>
        <article className="resumen-modulo-card">
          <span className="resumen-icono"><Icono name="clock" size={17} /></span>
          <span><small>Pendientes</small><strong>{cargando ? '…' : citasVisibles.filter((c) => c.status === 'Pendiente').length}</strong></span>
        </article>
        <article className="resumen-modulo-card">
          <span className="resumen-icono"><Icono name="check" size={17} /></span>
          <span><small>Confirmadas</small><strong>{cargando ? '…' : citasVisibles.filter((c) => c.status === 'Confirmada').length}</strong></span>
        </article>
      </section>

      <section className="tarjeta-contenido">
        <div className="barra-modulo">
          <div className="selector-vista">
            <button className={vista === 'lista' ? 'seleccionado' : ''} onClick={() => establecerVista('lista')} type="button">
              <Icono name="records" size={15} /> Lista
            </button>
            <button className={vista === 'calendario' ? 'seleccionado' : ''} onClick={() => establecerVista('calendario')} type="button">
              <Icono name="calendar" size={15} /> Calendario
            </button>
          </div>
          <div className="filtros-modulo">
            <label>
              Fecha
              <input
                aria-label="Filtrar por fecha"
                type="date"
                value={fechaFiltro}
                onChange={(e) => {
                  establecerFechaFiltro(e.target.value)
                  setPaginaActual(0)
                }}
              />
            </label>
            {fechaFiltro && (
              <button
                type="button"
                className="boton-secundario"
                style={{ padding: '6px 10px', fontSize: '12px' }}
                onClick={() => {
                  establecerFechaFiltro('')
                  setPaginaActual(0)
                }}
              >
                Limpiar fecha
              </button>
            )}
            <label>
              Estado
              <select
                value={estadoFiltro}
                onChange={(e) => {
                  establecerEstadoFiltro(e.target.value)
                  setPaginaActual(0)
                }}
              >
                <option>Todos</option>
                <option>Confirmada</option>
                <option>Pendiente</option>
                <option>Completada</option>
                <option>Cancelada</option>
              </select>
            </label>
            {user?.role !== 'DOCTOR' && (
              <label>
                Médico
                <select
                  value={medicoFiltro}
                  onChange={(e) => {
                    establecerMedicoFiltro(e.target.value)
                    setPaginaActual(0)
                  }}
                >
                  <option value="Todos">Todos</option>
                  {medicos.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </label>
            )}
            {user?.role === 'ADMIN' && (
              <label>
                Paciente
                <select
                  value={pacienteFiltro}
                  onChange={(e) => {
                    setPacienteFiltro(e.target.value)
                    setPaginaActual(0)
                  }}
                >
                  <option value="Todos">Todos</option>
                  {pacientes.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </div>

        {cargando ? (
          <div className="estado-vacio">Cargando citas…</div>
        ) : vista === 'lista' ? (
          <>
            <div className="desplazamiento-tabla">
              <table className="tabla-datos">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Paciente</th>
                    <th>Médico</th>
                    <th>Tipo de consulta</th>
                    <th>Modalidad</th>
                    <th>Motivo</th>
                    <th>Consultorio</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {citasVisibles.map((cita) => (
                    <tr key={cita.id}>
                      <td>{fechaLegible(cita.date)}</td>
                      <td className="hora-tabla">{cita.time}</td>
                      <td>{obtenerNombrePaciente(cita.patientId, cita.patientName)}</td>
                      <td>{obtenerNombreMedico(cita.doctorId, cita.doctorName)}</td>
                      <td>{cita.type || 'Consulta general'}</td>
                      <td>{cita.modality || 'Presencial'}</td>
                      <td>{cita.reason}</td>
                      <td>{cita.location || 'Por asignar'}</td>
                      <td>
                        <EtiquetaEstado estado={cita.status} className={claseEstadoCita(cita.status)} />
                      </td>
                      <td>
                        <div className="acciones-tabla">
                          <button type="button" onClick={() => { establecerFormulario(cita); establecerModal('detalle') }}>
                            <Icono name="eye" size={14} /> Ver
                          </button>
                          {!esPaciente && (
                            <button type="button" onClick={() => abrirFormulario(cita)}>
                              <Icono name="edit" size={14} /> Editar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!citasVisibles.length && (
                <div className="estado-vacio">
                  <strong>No hay citas para estos filtros</strong>
                  <span>Cambia la fecha o el estado.</span>
                </div>
              )}
            </div>

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
          </>
        ) : (
          <div className="calendario-mes">
            <div className="calendario-encabezado">
              <h2>Agenda del mes</h2>
              <span>{new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="calendario-dias">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((dia) => (
                <strong key={dia}>{dia}</strong>
              ))}
              {Array.from({ length: 42 }, (_, indice) => {
                const fecha = new Date()
                const primerDia = new Date(fecha.getFullYear(), fecha.getMonth(), 1)
                const numero = indice - ((primerDia.getDay() + 6) % 7) + 1
                const fechaCelda = new Date(fecha.getFullYear(), fecha.getMonth(), numero)
                const cadena = `${fechaCelda.getFullYear()}-${String(fechaCelda.getMonth() + 1).padStart(2, '0')}-${String(fechaCelda.getDate()).padStart(2, '0')}`
                const diaEsMes = fechaCelda.getMonth() === fecha.getMonth()
                const diaCitas = citas.filter((cita) => {
                  const coincidePaciente = !esPaciente || String(cita.patientId) === String(user?.patientId ?? '')
                  const coincideMedico = user?.role !== 'DOCTOR' || String(cita.doctorId) === String(user?.doctorId ?? '')
                  return cita.date === cadena && coincidePaciente && coincideMedico
                })
                return (
                  <button
                    className={`dia-calendario ${diaEsMes ? '' : 'fuera-mes'} ${cadena === hoy ? 'dia-hoy' : ''}`}
                    key={`${cadena}-${indice}`}
                    type="button"
                    onClick={() => { establecerFechaFiltro(cadena); establecerVista('lista') }}
                  >
                    <span>{fechaCelda.getDate()}</span>
                    {diaCitas.slice(0, 2).map((cita) => (
                      <small className={`evento-calendario ${claseEstadoCita(cita.status)}`} key={cita.id}>
                        {cita.time} · {cita.reason}
                      </small>
                    ))}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </section>

      {(modal === 'nueva' || modal === 'editar') && (
        <ModalFormulario titulo={modal === 'nueva' ? 'Agendar cita' : 'Editar cita'} alCerrar={() => establecerModal(null)}>
          <form className="formulario-modulo" noValidate onSubmit={guardar}>
            {errorServidor && <p style={{ color: '#b42318', margin: '0 0 10px' }}>{errorServidor}</p>}
            <div className="campos-dos-columnas">
              {esPaciente ? (
                <>
                  <input type="hidden" name="patientId" value={user?.patientId ?? ''} />
                  <label>
                    Paciente
                    <input readOnly value={obtenerNombrePaciente(user?.patientId, user?.name)} />
                  </label>
                </>
              ) : (
                <label>
                  Paciente
                  <select name="patientId" defaultValue={formulario.patientId} onChange={gestionarCambio} aria-invalid={Boolean(errores.patientId)}>
                    <option value="">Selecciona un paciente</option>
                    {pacientes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  {errores.patientId && <small className="error-campo">{errores.patientId}</small>}
                </label>
              )}
              <label>
                Médico
                <select name="doctorId" defaultValue={formulario.doctorId} onChange={gestionarCambio} aria-invalid={Boolean(errores.doctorId)}>
                  <option value="">Selecciona un médico</option>
                  {medicos.filter((m) => m.status === 'Activo').map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}{m.specialty ? ` · ${m.specialty}` : ''}{m.availability ? ` · ${m.availability}` : ''}
                    </option>
                  ))}
                </select>
                {errores.doctorId && <small className="error-campo">{errores.doctorId}</small>}
              </label>
              <label>
                Fecha
                <input name="date" type="date" defaultValue={formulario.date} onChange={gestionarCambio} aria-invalid={Boolean(errores.date)} />
                {errores.date && <small className="error-campo">{errores.date}</small>}
              </label>
              <label>
                Hora
                <input name="time" type="time" defaultValue={formulario.time} onChange={gestionarCambio} aria-invalid={Boolean(errores.time)} />
                {errores.time && <small className="error-campo">{errores.time}</small>}
              </label>
              <label>
                Tipo de consulta
                <select name="type" defaultValue={formulario.type || 'Consulta general'}>
                  <option>Consulta general</option>
                  <option>Primera consulta</option>
                  <option>Seguimiento</option>
                  <option>Control preventivo</option>
                  <option>Valoración médica</option>
                </select>
              </label>
              <label>
                Duración (minutos)
                <select name="duration" defaultValue={formulario.duration || '30'}>
                  <option value="15">15 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="45">45 minutos</option>
                  <option value="60">60 minutos</option>
                </select>
              </label>
              <label className="ancho-completo">
                Motivo
                <input name="reason" maxLength="120" defaultValue={formulario.reason} onChange={gestionarCambio} aria-invalid={Boolean(errores.reason)} />
                {errores.reason && <small className="error-campo">{errores.reason}</small>}
              </label>
              <label>
                Modalidad
                <select name="modality" defaultValue={formulario.modality || 'Presencial'}>
                  <option>Presencial</option>
                  <option>Teleconsulta</option>
                </select>
              </label>
              <label>
                Consultorio o enlace
                <input name="location" defaultValue={formulario.location || 'Consultorio 1'} />
              </label>
              {!esPaciente && modal === 'editar' && (
                <label>
                  Estado
                  <select name="status" defaultValue={formulario.status}>
                    <option>Pendiente</option>
                    <option>Confirmada</option>
                    <option>Completada</option>
                    <option>Cancelada</option>
                  </select>
                </label>
              )}
            </div>
            <div className="modal-pie interno">
              <button className="boton-secundario" type="button" onClick={() => establecerModal(null)}>
                Cancelar
              </button>
              <button className="accion-principal" type="submit">
                Guardar cita
              </button>
            </div>
          </form>
        </ModalFormulario>
      )}

      {modal === 'detalle' && (
        <ModalFormulario
          titulo="Detalle de cita"
          descripcion={`Cita #${formulario.id}`}
          alCerrar={() => establecerModal(null)}
          pie={
            <div className="acciones-modal">
              {!esPaciente && (
                <button className="boton-secundario" type="button" onClick={() => abrirFormulario(formulario)}>
                  Editar
                </button>
              )}
              {formulario.status !== 'Cancelada' && formulario.status !== 'Completada' && (
                <button className="boton-peligro" type="button" onClick={() => cambiarEstado(formulario, 'Cancelada')}>
                  Cancelar cita
                </button>
              )}
              {!esPaciente && formulario.status === 'Pendiente' && (
                <button className="accion-principal" type="button" onClick={() => cambiarEstado(formulario, 'Confirmada')}>
                  Confirmar
                </button>
              )}
              {!esPaciente && formulario.status === 'Confirmada' && (
                <button className="accion-principal" type="button" onClick={() => cambiarEstado(formulario, 'Completada')}>
                  Marcar completada
                </button>
              )}
            </div>
          }
        >
          <div className="rejilla-detalle">
            <div><span>Paciente</span><strong>{obtenerNombrePaciente(formulario.patientId, formulario.patientName)}</strong></div>
            <div><span>Médico</span><strong>{obtenerNombreMedico(formulario.doctorId, formulario.doctorName)}</strong></div>
            <div><span>Fecha</span><strong>{fechaLegible(formulario.date)}</strong></div>
            <div><span>Hora</span><strong>{formulario.time}</strong></div>
            <div><span>Tipo de consulta</span><strong>{formulario.type || 'Consulta general'}</strong></div>
            <div><span>Modalidad</span><strong>{formulario.modality || 'Presencial'}</strong></div>
            <div><span>Motivo</span><strong>{formulario.reason}</strong></div>
            <div><span>Duración</span><strong>{formulario.duration || '30'} minutos</strong></div>
            <div><span>Consultorio</span><strong>{formulario.location || 'Por asignar'}</strong></div>
            <div><span>Estado</span><strong>{formulario.status}</strong></div>
          </div>
        </ModalFormulario>
      )}
    </div>
  )
}
