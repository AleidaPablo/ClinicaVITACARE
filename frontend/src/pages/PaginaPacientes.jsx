import { useMemo, useState, useEffect } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import axiosClient from '../config/axiosClient' 
import Icono from '../components/Icono.jsx'
import EtiquetaEstado from '../components/EtiquetaEstado.jsx'
import ModalFormulario from '../components/ModalFormulario.jsx'
import { validarContrasena, validarCorreo, validarTelefono } from '../utilidades/validacionesFormulario.js'

const pacienteVacio = {
  name: '',
  email: '',
  age: '',
  dateOfBirth: '',
  sex: '',
  maritalStatus: '',
  occupation: '',
  address: '',
  phone: '',
  bloodType: '',
  emergencyContact: '',
  emergencyPhone: '',
  insurance: '',
  nss: '',
  status: 'Activo'
}

function iniciales(nombre = '') {
  return nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((parte) => parte[0]?.toUpperCase()).join('') || 'PA'
}

export default function PaginaPacientes({ patientOnly = false }) {
  const { user } = useOutletContext()
  const [params, setParams] = useSearchParams()
  const busqueda = params.get('search') ?? ''
  
  const [pacientes, setPacientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [paginaActual, setPaginaActual] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [totalElementos, setTotalElementos] = useState(0)


  const [filtroEstado, establecerFiltroEstado] = useState('Todos')
  const [modal, establecerModal] = useState(null)
  const [formulario, establecerFormulario] = useState(pacienteVacio)
  const [errores, establecerErrores] = useState({})
  const [errorServidor, establecerErrorServidor] = useState('')

  const esPaciente = patientOnly || user?.role === 'PATIENT'

  useEffect(() => {
    if (esPaciente) return; 

    const controlador = new AbortController()
    const fetchPacientes = async () => {
      await Promise.resolve()
      if (controlador.signal.aborted) return
      setCargando(true)
      try {
        const response = await axiosClient.get('/pacientes', {
          params: {
            page: paginaActual,
            size: 5,
            search: busqueda
          },
          signal: controlador.signal
        })

        if (controlador.signal.aborted) return
     
        const pacientesMapeados = response.data.content.map(p => {
         
          let edad = ''
          if (p.fechaNacimiento) {
            const hoy = new Date()
            const nacimiento = new Date(p.fechaNacimiento)
            edad = hoy.getFullYear() - nacimiento.getFullYear()
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
            nss: p.nss || '',
            status: p.activo ? 'Activo' : 'Inactivo',
            lastVisit: 'Sin visitas'
          }
        })

        setPacientes(pacientesMapeados)
        setTotalPaginas(response.data.totalPages)
        setTotalElementos(response.data.totalElements)
      } catch (error) {
        if (controlador.signal.aborted) return
        console.error("Error al cargar pacientes", error)
      } finally {
        if (!controlador.signal.aborted) setCargando(false)
      }
    }

    fetchPacientes()
    return () => controlador.abort()
  }, [paginaActual, busqueda, esPaciente])

  function validarCampo(nombre, valor) {
    const texto = String(valor ?? '').trim()

    if (nombre === 'name') {
      if (!texto) return 'Escribe el nombre del paciente.'
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(texto)) {
        return 'El nombre solo debe contener letras y espacios.'
      }
    }

    if (nombre === 'phone') {
      return validarTelefono(valor, true)
    }

    if (nombre === 'emergencyPhone') {
      return validarTelefono(valor)
    }

    if (nombre === 'email') {
      return validarCorreo(valor)
    }

    if (nombre === 'password' && texto) {
      return validarContrasena(valor)
    }

    return ''
  }

  function cambiarCampo(evento) {
    const { name, value } = evento.target
    if (['name', 'email', 'phone', 'emergencyPhone', 'password'].includes(name)) {
      establecerErrores((actuales) => ({
        ...actuales,
        [name]: validarCampo(name, value)
      }))
    }
  }


  const pacientesVisibles = useMemo(() => {
    return pacientes.filter(paciente => {
      if (filtroEstado === 'Todos') return true;
      return paciente.status === filtroEstado;
    })
  }, [pacientes, filtroEstado])

  function abrirFormulario(paciente = null) {
    establecerFormulario(paciente ? { ...paciente } : pacienteVacio)
    establecerErrores({})
    establecerModal(paciente ? { tipo: 'editar', paciente } : { tipo: 'nuevo' })
  }

  
  async function guardarPaciente(evento) {
    evento.preventDefault()

    const valores = Object.fromEntries(
      [...new FormData(evento.currentTarget)].map(([nombre, valor]) => [
        nombre, typeof valor === 'string' ? valor.trim() : valor
      ])
    )

    const erroresFormulario = Object.fromEntries(
      ['name', 'email', 'phone', 'emergencyPhone', 'password']
        .map((nombre) => [nombre, validarCampo(nombre, valores[nombre])])
        .filter(([, mensaje]) => mensaje)
    )
    if (modal.tipo === 'nuevo' && !valores.password) {
      erroresFormulario.password = 'Escribe una contraseña válida.'
    }

    establecerErrores(erroresFormulario)
    if (Object.keys(erroresFormulario).length) return

    try {
      
      const payload = {
        nombreCompleto: valores.name,
        email: valores.email,
        password: valores.password || undefined,
        telefono: valores.phone,
        fechaNacimiento: valores.dateOfBirth || null,
        sexo: valores.sex,
        estadoCivil: valores.maritalStatus,
        ocupacion: valores.occupation,
        direccion: valores.address,
        tipoSangre: valores.bloodType,
        contactoEmergenciaNombre: valores.emergencyContact,
        contactoEmergenciaTelefono: valores.emergencyPhone,
        tipoSeguro: valores.insurance,
        nss: valores.nss
      }

      if (modal.tipo === 'editar') {
        await axiosClient.put(`/pacientes/${modal.paciente.id}`, payload)
      } else {
        await axiosClient.post('/pacientes', payload)
      }


      setPaginaActual(0)
      establecerModal(null)
      establecerErrorServidor('')
    } catch (error) {
      establecerErrorServidor(error.response?.data?.mensaje || 'Error al guardar el paciente.')
    }
  }


  if (esPaciente) {
    return (
      <div className="pila-pagina">
        <div className="encabezado-pagina">
          <div>
            <h1>Mi expediente</h1>
            <p>Información de tu atención médica.</p>
          </div>
        </div>
        <p className="nota-pagina">Consulta tu información personal y clínica.</p>
        
        <section className="tarjeta-perfil-paciente">
          <span className="avatar-paciente-grande">{iniciales(user?.name)}</span>
          <div>
            <span className="id-paciente">MI PERFIL</span>
            <h2>{user?.name}</h2>
            <p>{user?.email}</p>
          </div>
          <span className="etiqueta-estado">Vista propia</span>
        </section>
      </div>
    )
  }

  
  return (
    <div className="pila-pagina">
      <div className="encabezado-pagina">
        <div>
          <h1>Gestión de pacientes</h1>
          <p>Directorio y datos de contacto.</p>
        </div>
        <button className="accion-principal" type="button" onClick={() => abrirFormulario()}>
          <span aria-hidden="true">＋</span> Registrar paciente
        </button>
      </div>

      <p className="nota-pagina">Consulta y administra el directorio de pacientes.</p>

      <section className="resumen-modulo-grid" aria-label="Resumen de pacientes">
        <article className="resumen-modulo-card">
          <span className="resumen-icono"><Icono name="patients" size={17} /></span>
          <span>
            <small>Pacientes en el directorio</small>
            <strong>{totalElementos}</strong>
          </span>
        </article>
        <article className="resumen-modulo-card">
          <span className="resumen-icono"><Icono name="check" size={17} /></span>
          <span>
            <small>Pacientes activos</small>
            <strong>{pacientes.filter((p) => p.status === 'Activo').length}</strong>
          </span>
        </article>
      </section>

      <section className="tarjeta-contenido">
        <div className="barra-pacientes">
          <div className="pestanas-pacientes">
            <button className={`pestana-paciente ${filtroEstado === 'Todos' ? 'seleccionado' : ''}`} onClick={() => establecerFiltroEstado('Todos')} type="button">
              Todos <b>{pacientes.length}</b>
            </button>
            <button className={`pestana-paciente ${filtroEstado === 'Activo' ? 'seleccionado' : ''}`} onClick={() => establecerFiltroEstado('Activo')} type="button">
              Activos <b>{pacientes.filter((p) => p.status === 'Activo').length}</b>
            </button>
          </div>

          <label className="busqueda-pacientes">
            <Icono name="search" size={15} />
            <input
              value={busqueda}
              onChange={(evento) => {
                const valor = evento.target.value
                valor ? setParams({ search: valor }) : setParams({})
                setPaginaActual(0) 
              }}
              placeholder="Buscar por nombre, correo, expediente o NSS…"
              aria-label="Buscar paciente"
            />
          </label>
        </div>

        <div className="desplazamiento-tabla">
          <table className="tabla-datos tabla-pacientes">
            <thead>
              <tr>
                <th>Expediente</th>
                <th>Paciente</th>
                <th>Edad</th>
                <th>Sexo</th>
                <th>Sangre</th>
                <th>Seguro</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan="9" style={{textAlign: 'center'}}>Cargando pacientes...</td></tr>
              ) : pacientesVisibles.map((paciente) => (
                <tr key={paciente.id}>
                  <td>{paciente.expediente}</td>
                  <td>
                    <span className="celda-paciente">
                      <span className="avatar-paciente">{iniciales(paciente.name)}</span>
                      <span>
                        <strong>{paciente.name}</strong>
                        <small>{paciente.email}</small>
                      </span>
                    </span>
                  </td>
                  <td>{paciente.age || '—'}</td>
                  <td>{paciente.sex === 'F' ? 'Femenino' : paciente.sex === 'M' ? 'Masculino' : paciente.sex || '—'}</td>
                  <td>{paciente.bloodType || '—'}</td>
                  <td>{paciente.insurance || '—'}</td>
                  <td>{paciente.phone}</td>
                  <td>
                    <EtiquetaEstado estado={paciente.status} className={paciente.status === 'Pendiente' ? 'estado-pendiente' : ''} />
                  </td>
                  <td>
                    <div className="acciones-tabla">
                      <button type="button" onClick={() => establecerModal({ tipo: 'detalle', paciente })}>
                        <Icono name="eye" size={14} />Ver
                      </button>
                      <button type="button" onClick={() => abrirFormulario(paciente)}>
                        <Icono name="edit" size={14} />Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CONTROLES DE PAGINACIÓN */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '0 10px' }}>
          <button className="boton-secundario" disabled={paginaActual === 0 || cargando} onClick={() => setPaginaActual(paginaActual - 1)}>
            ← Anterior
          </button>
          <span style={{ fontSize: '14px', color: '#666' }}>
            Página {paginaActual + 1} de {totalPaginas}
          </span>
          <button className="boton-secundario" disabled={paginaActual >= totalPaginas - 1 || cargando} onClick={() => setPaginaActual(paginaActual + 1)}>
            Siguiente →
          </button>
        </div>

        {!cargando && !pacientesVisibles.length && (
          <div className="estado-vacio">
            <strong>No encontramos pacientes</strong>
            <span>Cambia la búsqueda o el filtro seleccionado.</span>
          </div>
        )}
      </section>

      {/* MODAL DE DETALLE  */}
      {modal?.tipo === 'detalle' && (
        <ModalFormulario
          titulo={modal.paciente.name}
          descripcion={`Expediente · ${modal.paciente.expediente}`}
          alCerrar={() => establecerModal(null)}
          pie={
            <button className="boton-secundario" type="button" onClick={() => abrirFormulario(modal.paciente)}>
              Editar ficha
            </button>
          }
        >
          <div className="ficha-datos-grid">
            <div className="dato-ficha"><span>Sexo</span><strong>{modal.paciente.sex || 'Sin especificar'}</strong></div>
            <div className="dato-ficha"><span>Edad</span><strong>{modal.paciente.age ? `${modal.paciente.age} años` : 'No indicada'}</strong></div>
            <div className="dato-ficha"><span>Fecha de nacimiento</span><strong>{modal.paciente.dateOfBirth || 'Sin registro'}</strong></div>
            <div className="dato-ficha"><span>Tipo de sangre</span><strong>{modal.paciente.bloodType || 'Sin registro'}</strong></div>
            <div className="dato-ficha ancho-completo"><span>Domicilio</span><strong>{modal.paciente.address || 'Sin registro'}</strong></div>
            <div className="dato-ficha"><span>Correo</span><strong>{modal.paciente.email}</strong></div>
            <div className="dato-ficha"><span>Teléfono</span><strong>{modal.paciente.phone}</strong></div>
            <div className="dato-ficha ancho-completo dato-destacado"><span>Contacto de emergencia</span><strong>{modal.paciente.emergencyContact || 'Sin registro'} · {modal.paciente.emergencyPhone || 'Sin teléfono'}</strong></div>
            <div className="dato-ficha"><span>Seguro médico</span><strong>{modal.paciente.insurance || 'Sin registro'}</strong></div>
            <div className="dato-ficha"><span>NSS</span><strong>{modal.paciente.nss || 'Sin registro'}</strong></div>
            <div className="dato-ficha"><span>Estado</span><strong>{modal.paciente.status}</strong></div>
          </div>
        </ModalFormulario>
      )}

      {}
      {(modal?.tipo === 'nuevo' || modal?.tipo === 'editar') && (
        <ModalFormulario
          titulo={modal.tipo === 'nuevo' ? 'Registrar paciente' : 'Editar paciente'}
          descripcion="Información de contacto del paciente."
          alCerrar={() => establecerModal(null)}
        >
          <form className="formulario-modulo" onSubmit={guardarPaciente} noValidate>
            {errorServidor && <p style={{ color: '#b42318', margin: '0 0 10px' }}>{errorServidor}</p>}
            <fieldset className="grupo-campos-clinicos">
              <legend>Datos personales</legend>
              <div className="campos-dos-columnas">
                <label>Nombre completo
                  <input name="name" defaultValue={formulario.name} autoFocus onChange={cambiarCampo} aria-invalid={Boolean(errores.name)} />
                  {errores.name && <small className="error-campo">{errores.name}</small>}
                </label>
                <label>Correo electrónico
                  <input name="email" type="email" defaultValue={formulario.email} onChange={cambiarCampo} aria-invalid={Boolean(errores.email)} />
                  {errores.email && <small className="error-campo">{errores.email}</small>}
                </label>
                {modal.tipo === 'nuevo' && (
                  <label>Contraseña
                    <input name="password" type="password" onChange={cambiarCampo} aria-invalid={Boolean(errores.password)} />
                    {errores.password && <small className="error-campo">{errores.password}</small>}
                  </label>
                )}
                <label>Teléfono
                  <input name="phone" type="tel" maxLength={10} defaultValue={formulario.phone} onChange={cambiarCampo} aria-invalid={Boolean(errores.phone)} />
                  {errores.phone && <small className="error-campo">{errores.phone}</small>}
                </label>
                <label>Fecha de nacimiento
                  <input name="dateOfBirth" type="date" defaultValue={formulario.dateOfBirth} />
                </label>
                <label>Sexo
                  <select name="sex" defaultValue={formulario.sex}>
                    <option value="">Sin especificar</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </label>
                <label>Tipo de sangre
                  <select name="bloodType" defaultValue={formulario.bloodType}>
                    <option value="">Sin especificar</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((tipo) => <option key={tipo}>{tipo}</option>)}
                  </select>
                </label>
                <label>Seguro médico
                  <input name="insurance" defaultValue={formulario.insurance} />
                </label>
                <label>NSS
                  <input name="nss" defaultValue={formulario.nss} />
                </label>
              </div>
            </fieldset>
            <div className="modal-pie interno">
              <button className="boton-secundario" type="button" onClick={() => establecerModal(null)}>Cancelar</button>
              <button className="accion-principal" type="submit">{modal.tipo === 'nuevo' ? 'Agregar' : 'Guardar cambios'}</button>
            </div>
          </form>
        </ModalFormulario>
      )}
    </div>
  )
}