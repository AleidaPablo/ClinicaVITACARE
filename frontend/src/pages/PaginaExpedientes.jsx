import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import Icono from '../components/Icono.jsx'
import ModalFormulario from '../components/ModalFormulario.jsx'
import { normalizarDatosFormulario } from '../utilidades/validacionesFormulario.js'
import axiosClient from '../config/axiosClient'

const expedienteVacio = {
  antecedentes: 'Sin antecedentes registrados.',
  alergias: 'No conocidas',
  padecimientos: 'Sin padecimientos crónicos registrados',
  medicamentos: 'Sin medicamentos de uso continuo',
  cirugias: 'Sin antecedentes quirúrgicos registrados',
  antecedentesFamiliares: 'Sin antecedentes familiares relevantes',
  entradas: []
}

function fechaLegible(fecha) {
  if (!fecha) return 'Sin registro'
  return new Date(`${fecha}T12:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function PaginaExpedientes() {
  const { user } = useOutletContext()
  const esPaciente = user?.role === 'PATIENT'

  const [pacientes, setPacientes] = useState([])
  const [medicos, setMedicos] = useState([])
  const [expedientesResumen, setExpedientesResumen] = useState([])
  const [expedienteDetalle, setExpedienteDetalle] = useState(null)
  const [cargandoLista, setCargandoLista] = useState(true)
  const [cargandoDetalle, setCargandoDetalle] = useState(false)
  const [errorServidor, setErrorServidor] = useState('')

  const [busqueda, establecerBusqueda] = useState('')
  const [pacienteActivo, establecerPacienteActivo] = useState(null)
  const [modal, establecerModal] = useState(false)
  const [errores, establecerErrores] = useState({})

  
  const cargarDatos = useCallback(async (signal) => {
    setCargandoLista(true)
    setErrorServidor('')
    try {
      if (esPaciente) {
        const [resPerfil, resExpediente] = await Promise.all([
          axiosClient.get('/usuarios/me', { signal }),
          axiosClient.get('/expedientes/mi-expediente', { signal })
        ])
        if (signal?.aborted) return
        const perfil = resPerfil.data
        const expediente = resExpediente.data
        const nacimiento = perfil.fechaNacimiento ? new Date(`${perfil.fechaNacimiento}T12:00:00`) : null
        const edad = nacimiento ? new Date().getFullYear() - nacimiento.getFullYear() : ''
        const propio = {
          id: expediente.patientId,
          expediente: `EXP-${String(expediente.patientId).padStart(4, '0')}`,
          name: perfil.nombreCompleto || expediente.patientName || user?.name || '',
          email: perfil.email || user?.email || '',
          phone: perfil.telefono || '',
          dateOfBirth: perfil.fechaNacimiento || '',
          age: edad,
          sex: perfil.sexo || '',
          maritalStatus: perfil.estadoCivil || '',
          occupation: perfil.ocupacion || '',
          address: perfil.direccion || '',
          bloodType: perfil.tipoSangre || '',
          emergencyContact: perfil.contactoEmergenciaNombre || '',
          emergencyPhone: perfil.contactoEmergenciaTelefono || '',
          insurance: perfil.tipoSeguro || '',
          nss: perfil.nss || ''
        }
        setPacientes([propio])
        setExpedientesResumen([expediente])
        setExpedienteDetalle(expediente)
        setMedicos(Array.from(
          new Map((expediente.entradas || [])
            .filter((entrada) => entrada.doctorId)
            .map((entrada) => [String(entrada.doctorId), {
              id: entrada.doctorId,
              name: entrada.doctorName || 'Médico',
              specialty: 'Medicina General',
              status: 'Activo'
            }])).values()
        ))
        establecerPacienteActivo(propio)
      } else {
        const [resPacientes, resMedicos, resExpedientes] = await Promise.all([
          axiosClient.get('/pacientes', { params: { size: 100 }, signal }),
          axiosClient.get('/medicos', { params: { size: 100 }, signal }).catch(() => ({ data: { content: [] } })),
          axiosClient.get('/expedientes', { params: { size: 100 }, signal }).catch(() => ({ data: { content: [] } }))
        ])
        if (signal?.aborted) return
        const pacientesMap = (resPacientes.data?.content || []).map((p) => {
          let edad = ''
          if (p.fechaNacimiento) {
            const hoy = new Date()
            const nac = new Date(p.fechaNacimiento)
            edad = hoy.getFullYear() - nac.getFullYear()
          }
          return {
            id: p.id,
            expediente: `EXP-${String(p.id).padStart(4, '0')}`,
            name: p.nombreCompleto,
            email: p.email,
            phone: p.telefono || '',
            dateOfBirth: p.fechaNacimiento || '',
            age: edad,
            sex: p.sexo || '',
            maritalStatus: p.estadoCivil || '',
            occupation: p.ocupacion || '',
            address: p.direccion || '',
            bloodType: p.tipoSangre || '',
            emergencyContact: p.contactoEmergenciaNombre || '',
            emergencyPhone: p.contactoEmergenciaTelefono || '',
            insurance: p.tipoSeguro || '',
            nss: p.nss || ''
          }
        })
        const medicosMap = (resMedicos.data?.content || []).map((m) => ({
          id: m.id,
          name: m.nombreCompleto,
          specialty: 'Medicina General',
          status: m.activo ? 'Activo' : 'Inactivo'
        }))
        setPacientes(pacientesMap)
        setMedicos(medicosMap)
        const expData = resExpedientes.data
        const listaExpedientes = Array.isArray(expData) ? expData : (expData?.content || [])
        setExpedientesResumen(listaExpedientes)
      }
    } catch (err) {
      if (signal?.aborted) return
      console.error('Error al cargar expedientes:', err)
      setErrorServidor('No se pudo conectar con el servidor para cargar los pacientes y expedientes.')
    } finally {
      if (!signal?.aborted) setCargandoLista(false)
    }
  }, [esPaciente, user])

  useEffect(() => {
    const controlador = new AbortController()
    Promise.resolve().then(() => {
      if (!controlador.signal.aborted) cargarDatos(controlador.signal)
    })
    return () => controlador.abort()
  }, [cargarDatos])

 
  const cargarExpedienteDetalle = useCallback(async (pacienteId, signal) => {
    if (!pacienteId) return
    setCargandoDetalle(true)
    setErrorServidor('')
    try {
      const res = await axiosClient.get(`/expedientes/paciente/${pacienteId}`, { signal })
      if (signal?.aborted) return
      setExpedienteDetalle(res.data)
    } catch (err) {
      if (signal?.aborted) return
      console.error('Error al cargar detalle del expediente:', err)
      setErrorServidor('No se pudo cargar el detalle del expediente clínico.')
    } finally {
      if (!signal?.aborted) setCargandoDetalle(false)
    }
  }, [])

  useEffect(() => {
    const controlador = new AbortController()
    if (pacienteActivo && !esPaciente) {
      Promise.resolve().then(() => {
        if (!controlador.signal.aborted) {
          cargarExpedienteDetalle(pacienteActivo.id, controlador.signal)
        }
      })
    }
    return () => controlador.abort()
  }, [pacienteActivo, esPaciente, cargarExpedienteDetalle])

  const pacientesVisibles = pacientes.filter(
    (paciente) =>
      `${paciente.name} ${paciente.id} ${paciente.expediente ?? ''} ${paciente.nss ?? ''}`
        .toLowerCase()
        .includes(busqueda.toLowerCase()) &&
      (!esPaciente || String(paciente.id) === String(user?.patientId ?? ''))
  )

  const expedienteActivo = expedienteDetalle ?? expedienteVacio

  function validarCampo(nombre, valor) {
    const texto = String(valor ?? '').trim()
    if (['motivo', 'diagnostico', 'doctorId', 'tratamiento'].includes(nombre) && !texto) return 'Completa este campo.'
    const limites = { pulso: [30, 220], temperatura: [30, 45], peso: [1, 350], estatura: [0.3, 2.5] }
    if (texto && limites[nombre]) {
      const [minimo, maximo] = limites[nombre]
      if (!Number.isFinite(Number(texto)) || Number(texto) < minimo || Number(texto) > maximo) {
        return `El valor debe estar entre ${minimo} y ${maximo}.`
      }
    }
    return ''
  }

  async function agregarEntrada(evento) {
    evento.preventDefault()
    setErrorServidor('')
    const datos = normalizarDatosFormulario(evento.currentTarget)
    const erroresValidacion = Object.fromEntries(
      ['motivo', 'diagnostico', 'doctorId', 'tratamiento', 'pulso', 'temperatura', 'peso', 'estatura']
        .map((campo) => [campo, validarCampo(campo, datos[campo])])
        .filter(([, error]) => error)
    )
    establecerErrores(erroresValidacion)
    if (Object.keys(erroresValidacion).length) return

    const payload = {
      doctorId: Number(datos.doctorId),
      motivo: datos.motivo,
      diagnostico: datos.diagnostico,
      tratamiento: datos.tratamiento,
      medicamentos: datos.medicamentos || '',
      estudios: datos.estudios || '',
      proximaRevision: datos.proximaRevision || null,
      observaciones: datos.observaciones || '',
      presion: datos.presion || '',
      pulso: datos.pulso ? Number(datos.pulso) : null,
      temperatura: datos.temperatura ? Number(datos.temperatura) : null,
      peso: datos.peso ? Number(datos.peso) : null,
      estatura: datos.estatura ? Number(datos.estatura) : null
    }

    try {
      const res = await axiosClient.post(`/expedientes/paciente/${pacienteActivo.id}/consultas`, payload)
      setExpedienteDetalle(res.data)
      establecerModal(false)
      cargarDatos()
    } catch (err) {
      console.error('Error al agregar consulta:', err)
      setErrorServidor(err.response?.data?.mensaje || err.response?.data?.message || 'Error al guardar la consulta clínica.')
    }
  }

  async function guardarResumen(evento) {
    evento.preventDefault()
    setErrorServidor('')
    const datos = normalizarDatosFormulario(evento.currentTarget)

    const payload = {
      antecedentes: datos.antecedentes,
      alergias: datos.alergias,
      padecimientos: datos.padecimientos,
      medicamentos: datos.medicamentos,
      cirugias: datos.cirugias,
      antecedentesFamiliares: datos.antecedentesFamiliares
    }

    try {
      const res = await axiosClient.put(`/expedientes/paciente/${pacienteActivo.id}`, payload)
      setExpedienteDetalle(res.data)
      establecerModal(false)
    } catch (err) {
      console.error('Error al actualizar resumen clínico:', err)
      setErrorServidor(err.response?.data?.mensaje || err.response?.data?.message || 'Error al guardar antecedentes médicos.')
    }
  }

  function gestionarCambio(evento) {
    const { name, value } = evento.target
    establecerErrores((actuales) => ({ ...actuales, [name]: validarCampo(name, value) }))
  }

  const datosPersonales = pacienteActivo
    ? [
        ['Nombre completo', pacienteActivo.name],
        ['Sexo', pacienteActivo.sex === 'F' ? 'Femenino' : pacienteActivo.sex === 'M' ? 'Masculino' : pacienteActivo.sex || 'Sin especificar'],
        ['Edad', pacienteActivo.age ? `${pacienteActivo.age} años` : 'Sin registro'],
        ['Fecha de nacimiento', fechaLegible(pacienteActivo.dateOfBirth)],
        ['Domicilio', pacienteActivo.address || 'Sin registro', 'ancho-completo'],
        ['Estado civil', pacienteActivo.maritalStatus || 'Sin registro'],
        ['Ocupación', pacienteActivo.occupation || 'Sin registro'],
        ['Teléfono de contacto', pacienteActivo.phone || 'Sin registro'],
        ['Tipo de sangre', pacienteActivo.bloodType || 'Sin registro', 'dato-destacado'],
        [
          'Contacto de emergencia',
          `${pacienteActivo.emergencyContact || 'Sin registro'}${pacienteActivo.emergencyPhone ? ` · ${pacienteActivo.emergencyPhone}` : ''}`,
          'ancho-completo dato-destacado'
        ],
        ['Seguro médico', pacienteActivo.insurance || 'Sin registro'],
        ['NSS', pacienteActivo.nss || 'Sin registro']
      ]
    : []

  const obtenerResumenPaciente = (pacienteId) => {
    const lista = Array.isArray(expedientesResumen) ? expedientesResumen : (expedientesResumen?.content || [])
    const exp = lista.find((e) => String(e.patientId) === String(pacienteId))
    return {
      conteoConsultas: exp?.entradas?.length ?? 0,
      ultimaVisita: exp?.ultimaVisita || null
    }
  }

  return (
    <div className="pila-pagina pagina-expedientes">
      <div className="encabezado-pagina">
        <div>
          <h1>{esPaciente ? 'Mi expediente clínico' : 'Expedientes clínicos'}</h1>
          <p>Información personal, antecedentes y seguimiento de atención.</p>
        </div>
      </div>

      {errorServidor && (
        <div style={{ backgroundColor: '#fef3f2', color: '#b42318', padding: '12px 16px', borderRadius: '8px', border: '1px solid #fecdca' }}>
          {errorServidor}
        </div>
      )}

      {!pacienteActivo ? (
        <section className="tarjeta-contenido">
          <div className="barra-modulo">
            <label className="busqueda-pacientes">
              <Icono name="search" size={17} />
              <input
                aria-label="Buscar paciente"
                placeholder="Buscar por nombre, expediente o NSS…"
                value={busqueda}
                onChange={(evento) => establecerBusqueda(evento.target.value)}
              />
            </label>
            <span className="texto-secundario">{pacientesVisibles.length} expedientes</span>
          </div>

          {cargandoLista ? (
            <div className="estado-vacio">Cargando expedientes…</div>
          ) : (
            <div className="lista-expedientes">
              {pacientesVisibles.map((paciente) => {
                const resumen = obtenerResumenPaciente(paciente.id)
                return (
                  <button className="fila-expediente" type="button" key={paciente.id} onClick={() => establecerPacienteActivo(paciente)}>
                    <span className="avatar-paciente">{paciente.name.slice(0, 1)}</span>
                    <span className="datos-fila-expediente">
                      <strong>{paciente.name}</strong>
                      <small>
                        {paciente.expediente ?? paciente.id} · {resumen.conteoConsultas} consultas registradas
                      </small>
                    </span>
                    <span className="ultima-visita">Última visita: {fechaLegible(resumen.ultimaVisita)}</span>
                    <span className="flecha-detalle">›</span>
                  </button>
                )
              })}
              {!pacientesVisibles.length && <div className="estado-vacio">No hay expedientes que coincidan con la búsqueda.</div>}
            </div>
          )}
        </section>
      ) : (
        <div className="pila-pagina detalle-expediente">
          {!esPaciente && (
            <button className="enlace-volver" type="button" onClick={() => establecerPacienteActivo(null)}>
              ← Volver al listado
            </button>
          )}

          <section className="tarjeta-perfil-paciente encabezado-expediente">
            <span className="avatar-paciente-grande">{pacienteActivo.name.slice(0, 1)}</span>
            <div>
              <span className="id-paciente">EXPEDIENTE · {pacienteActivo.expediente ?? pacienteActivo.id}</span>
              <h2>{pacienteActivo.name}</h2>
              <p>
                {pacienteActivo.age ? `${pacienteActivo.age} años` : 'Edad sin registrar'} · {pacienteActivo.email}
              </p>
            </div>
            {!esPaciente && (
              <button className="accion-principal" type="button" onClick={() => establecerModal('consulta')}>
                <Icono name="records" size={16} /> Añadir consulta
              </button>
            )}
          </section>

          <section className="tarjeta-contenido ficha-personal-expediente">
            <div className="encabezado-seccion">
              <div className="encabezado-seccion-icono">
                <span className="icono-seccion-lavanda"><Icono name="profile" size={17} /></span>
                <div>
                  <h2>Datos personales</h2>
                  <p>Información de contacto y afiliación</p>
                </div>
              </div>
            </div>
            <div className="ficha-datos-grid">
              {datosPersonales.map(([titulo, valor, clase = '']) => (
                <div className={`dato-ficha ${clase}`} key={titulo}>
                  <span>{titulo}</span>
                  <strong>{valor}</strong>
                </div>
              ))}
            </div>
          </section>

          {cargandoDetalle ? (
            <div className="estado-vacio">Cargando historial clínico…</div>
          ) : (
            <>
              <section className="tarjeta-contenido">
                <div className="encabezado-seccion">
                  <div className="encabezado-seccion-icono">
                    <span className="icono-seccion-cielo"><Icono name="corazon" size={17} /></span>
                    <div>
                      <h2>Resumen clínico</h2>
                      <p>Antecedentes y datos importantes de salud</p>
                    </div>
                  </div>
                  {!esPaciente && (
                    <button className="boton-secundario" type="button" onClick={() => establecerModal('resumen')}>
                      Editar resumen
                    </button>
                  )}
                </div>
                <div className="resumen-medico-grid">
                  <article>
                    <span className="resumen-medico-icono alergia"><Icono name="destellos" size={17} /></span>
                    <div>
                      <small>Alergias</small>
                      <strong>{expedienteActivo.alergias}</strong>
                    </div>
                  </article>
                  <article>
                    <span className="resumen-medico-icono padecimiento"><Icono name="corazon" size={17} /></span>
                    <div>
                      <small>Padecimientos</small>
                      <strong>{expedienteActivo.padecimientos}</strong>
                    </div>
                  </article>
                  <article>
                    <span className="resumen-medico-icono medicamento"><Icono name="records" size={17} /></span>
                    <div>
                      <small>Medicamentos actuales</small>
                      <strong>{expedienteActivo.medicamentos}</strong>
                    </div>
                  </article>
                  <article>
                    <span className="resumen-medico-icono familiar"><Icono name="patients" size={17} /></span>
                    <div>
                      <small>Antecedentes familiares</small>
                      <strong>{expedienteActivo.antecedentesFamiliares}</strong>
                    </div>
                  </article>
                  <article className="ancho-completo">
                    <span className="resumen-medico-icono cirugia"><Icono name="records" size={17} /></span>
                    <div>
                      <small>Antecedentes quirúrgicos</small>
                      <strong>{expedienteActivo.cirugias}</strong>
                    </div>
                  </article>
                </div>
                <p className="texto-antecedentes">{expedienteActivo.antecedentes}</p>
              </section>

              <section className="tarjeta-contenido">
                <div className="encabezado-seccion">
                  <div className="encabezado-seccion-icono">
                    <span className="icono-seccion-cielo"><Icono name="clock" size={17} /></span>
                    <div>
                      <h2>Consultas y evolución</h2>
                      <p>Notas clínicas, tratamientos y signos vitales</p>
                    </div>
                  </div>
                  <span className="conteo-seccion">{expedienteActivo.entradas?.length ?? 0}</span>
                </div>
                <div className="linea-tiempo">
                  {expedienteActivo.entradas?.map((entrada) => (
                    <article className="entrada-clinica" key={entrada.id}>
                      <span className="punto-linea-tiempo" />
                      <div className="entrada-clinica-cabecera">
                        <div>
                          <time>{fechaLegible(entrada.fecha)}</time>
                          <h3>{entrada.motivo || entrada.diagnostico}</h3>
                        </div>
                        <span className="profesional-nota">
                          {medicos.find((m) => String(m.id) === String(entrada.doctorId))?.name ?? entrada.doctorName ?? 'Equipo médico'}
                        </span>
                      </div>
                      <div className="diagnostico-nota">
                        <small>Diagnóstico</small>
                        <strong>{entrada.diagnostico}</strong>
                      </div>
                      <div className="signos-vitales-grid">
                        {[
                          ['Presión arterial', entrada.presion, 'mmHg'],
                          ['Pulso', entrada.pulso, 'lpm'],
                          ['Temperatura', entrada.temperatura, '°C'],
                          ['Peso', entrada.peso, 'kg'],
                          ['Estatura', entrada.estatura, 'm']
                        ]
                          .filter(([, valor]) => valor)
                          .map(([titulo, valor, unidad]) => (
                            <div key={titulo}>
                              <small>{titulo}</small>
                              <strong>
                                {valor} <span>{unidad}</span>
                              </strong>
                            </div>
                          ))}
                      </div>
                      <div className="rejilla-detalle">
                        <div>
                          <span>Tratamiento</span>
                          <strong>{entrada.tratamiento || 'Sin indicaciones adicionales'}</strong>
                        </div>
                        <div>
                          <span>Medicamentos</span>
                          <strong>{entrada.medicamentos || 'Sin receta nueva'}</strong>
                        </div>
                        <div>
                          <span>Estudios solicitados</span>
                          <strong>{entrada.estudios || 'Sin estudios adicionales'}</strong>
                        </div>
                        <div>
                          <span>Próxima revisión</span>
                          <strong>{fechaLegible(entrada.proximaRevision)}</strong>
                        </div>
                        <div className="ancho-completo">
                          <span>Observaciones</span>
                          <strong>{entrada.observaciones || 'Sin observaciones adicionales'}</strong>
                        </div>
                      </div>
                    </article>
                  ))}
                  {(!expedienteActivo.entradas || !expedienteActivo.entradas.length) && (
                    <div className="estado-vacio">Aún no hay consultas registradas en este expediente.</div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      )}

      {modal === 'consulta' && (
        <ModalFormulario titulo="Registrar consulta" descripcion={`Nueva nota clínica para ${pacienteActivo?.name}.`} alCerrar={() => establecerModal(false)}>
          <form className="formulario-modulo" noValidate onSubmit={agregarEntrada}>
            <div className="campos-dos-columnas">
              <label className="ancho-completo">
                Motivo de consulta
                <input name="motivo" onChange={gestionarCambio} aria-invalid={Boolean(errores.motivo)} />
                {errores.motivo && <small className="error-campo">{errores.motivo}</small>}
              </label>
              <label>
                Diagnóstico
                <input name="diagnostico" onChange={gestionarCambio} aria-invalid={Boolean(errores.diagnostico)} />
                {errores.diagnostico && <small className="error-campo">{errores.diagnostico}</small>}
              </label>
              <label>
                Profesional
                <select name="doctorId" defaultValue={user?.doctorId ?? medicos[0]?.id} onChange={gestionarCambio} aria-invalid={Boolean(errores.doctorId)}>
                  <option value="">Selecciona al profesional</option>
                  {medicos.filter((medico) => medico.status === 'Activo').map((medico) => (
                    <option key={medico.id} value={medico.id}>
                      {medico.name} · {medico.specialty}
                    </option>
                  ))}
                </select>
                {errores.doctorId && <small className="error-campo">{errores.doctorId}</small>}
              </label>
              <label className="ancho-completo">
                Tratamiento e indicaciones
                <textarea name="tratamiento" rows="3" onChange={gestionarCambio} aria-invalid={Boolean(errores.tratamiento)} />
                {errores.tratamiento && <small className="error-campo">{errores.tratamiento}</small>}
              </label>
              <label className="ancho-completo">
                Medicamentos recetados
                <textarea name="medicamentos" rows="2" placeholder="Nombre, dosis y frecuencia" />
              </label>
              <label>
                Estudios solicitados
                <input name="estudios" placeholder="Laboratorio o imagenología" />
              </label>
              <label>
                Próxima revisión
                <input name="proximaRevision" type="date" />
              </label>
            </div>
            <fieldset className="grupo-signos-vitales">
              <legend>Signos vitales</legend>
              <div className="campos-dos-columnas">
                <label>
                  Presión arterial
                  <input name="presion" placeholder="120/80" />
                </label>
                <label>
                  Pulso (lpm)
                  <input name="pulso" type="number" min="30" max="220" onChange={gestionarCambio} aria-invalid={Boolean(errores.pulso)} />
                  {errores.pulso && <small className="error-campo">{errores.pulso}</small>}
                </label>
                <label>
                  Temperatura (°C)
                  <input name="temperatura" type="number" min="30" max="45" step="0.1" onChange={gestionarCambio} aria-invalid={Boolean(errores.temperatura)} />
                  {errores.temperatura && <small className="error-campo">{errores.temperatura}</small>}
                </label>
                <label>
                  Peso (kg)
                  <input name="peso" type="number" min="1" max="350" step="0.1" onChange={gestionarCambio} aria-invalid={Boolean(errores.peso)} />
                  {errores.peso && <small className="error-campo">{errores.peso}</small>}
                </label>
                <label>
                  Estatura (m)
                  <input name="estatura" type="number" min="0.3" max="2.5" step="0.01" onChange={gestionarCambio} aria-invalid={Boolean(errores.estatura)} />
                  {errores.estatura && <small className="error-campo">{errores.estatura}</small>}
                </label>
              </div>
            </fieldset>
            <label>
              Observaciones
              <textarea name="observaciones" rows="3" />
            </label>
            <div className="modal-pie interno">
              <button className="boton-secundario" type="button" onClick={() => establecerModal(false)}>
                Cancelar
              </button>
              <button className="accion-principal" type="submit">
                Guardar consulta
              </button>
            </div>
          </form>
        </ModalFormulario>
      )}

      {modal === 'resumen' && (
        <ModalFormulario titulo="Editar resumen clínico" descripcion={`Antecedentes médicos de ${pacienteActivo?.name}.`} alCerrar={() => establecerModal(false)}>
          <form className="formulario-modulo" onSubmit={guardarResumen}>
            <label>
              Antecedentes
              <textarea name="antecedentes" rows="3" defaultValue={expedienteActivo.antecedentes} />
            </label>
            <label>
              Alergias
              <textarea name="alergias" rows="2" defaultValue={expedienteActivo.alergias} />
            </label>
            <label>
              Padecimientos crónicos
              <textarea name="padecimientos" rows="2" defaultValue={expedienteActivo.padecimientos} />
            </label>
            <label>
              Medicamentos de uso continuo
              <textarea name="medicamentos" rows="2" defaultValue={expedienteActivo.medicamentos} />
            </label>
            <label>
              Antecedentes quirúrgicos
              <textarea name="cirugias" rows="2" defaultValue={expedienteActivo.cirugias} />
            </label>
            <label>
              Antecedentes familiares
              <textarea name="antecedentesFamiliares" rows="2" defaultValue={expedienteActivo.antecedentesFamiliares} />
            </label>
            <div className="modal-pie interno">
              <button className="boton-secundario" type="button" onClick={() => establecerModal(false)}>
                Cancelar
              </button>
              <button className="accion-principal" type="submit">
                Guardar antecedentes
              </button>
            </div>
          </form>
        </ModalFormulario>
      )}
    </div>
  )
}
