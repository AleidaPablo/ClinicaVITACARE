
import { useMemo, useState } from 'react'
import Icono from '../components/Icono.jsx'
import ModalFormulario from '../components/ModalFormulario.jsx'
import { useDatosDemostracion } from '../context/useDatosDemostracion.js'
import {
  normalizarDatosFormulario,
  validarCorreo,
  validarTelefono
} from '../utilidades/validacionesFormulario.js'

const medicoVacio = {
  name: '',
  specialty: '',
  email: '',
  phone: '',
  license: '',
  experience: '',
  languages: '',
  consultationRoom: '',
  availability: '',
  status: 'Activo'
}

export default function PaginaMedicos() {
  const { medicos, establecerMedicos } = useDatosDemostracion()
  const [busqueda, establecerBusqueda] = useState('')
  const [especialidad, establecerEspecialidad] = useState('Todas')
  const [modal, establecerModal] = useState(null)
  const [formulario, establecerFormulario] = useState(medicoVacio)
  const [errores, establecerErrores] = useState({})

  const especialidades = [...new Set(medicos.map((medico) => medico.specialty))]

  const visibles = useMemo(
    () => medicos.filter((medico) =>
      `${medico.name} ${medico.specialty} ${medico.email}`
        .toLowerCase()
        .includes(busqueda.toLowerCase()) &&
      (especialidad === 'Todas' || medico.specialty === especialidad)
    ),
    [medicos, busqueda, especialidad]
  )

  function abrir(medico) {
    establecerFormulario(medico ? { ...medico } : medicoVacio)
    establecerErrores({})
    establecerModal(medico ? 'editar' : 'nuevo')
  }

  
function validarCampo(nombre, valor) {
  const texto = String(valor ?? '').trim()

  if (['name', 'specialty'].includes(nombre) && !texto) {
    return 'Este campo es obligatorio.'
  }

  if (nombre === 'name' && !/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(texto)) {
    return 'El nombre solo debe contener letras y espacios.'
  }

  if (nombre === 'phone') {
    return validarTelefono(valor, true)
  }

  if (nombre === 'experience' && texto && (
    Number(texto) < 0 || Number(texto) > 60
  )) {
    return 'Los años de experiencia deben estar entre 0 y 60.'
  }

  if (nombre === 'email') {
    const error = validarCorreo(texto)

    if (error) return error

    if (medicos.some((medico) =>
      medico.email.toLowerCase() === texto.toLowerCase() &&
      medico.id !== formulario.id
    )) {
      return 'Ese correo ya está registrado.'
    }
  }

  return ''
}


  function gestionarCambio(evento) {
    const { name, value } = evento.target

    establecerErrores((actuales) => ({
      ...actuales,
      [name]: validarCampo(name, value)
    }))
  }

  function guardar(evento) {
    evento.preventDefault()

    const valores = normalizarDatosFormulario(evento.currentTarget)

    const erroresValidacion = Object.fromEntries(
      ['name', 'specialty', 'email', 'phone', 'experience']
        .map((campo) => [
          campo,
          validarCampo(campo, valores[campo])
        ])
        .filter(([, error]) => error)
    )

    establecerErrores(erroresValidacion)

    if (Object.keys(erroresValidacion).length) return

    if (modal === 'editar') {
      establecerMedicos((lista) =>
        lista.map((medico) =>
          medico.id === formulario.id
            ? { ...medico, ...valores }
            : medico
        )
      )
    } else {
      establecerMedicos((lista) => [
        {
          ...valores,
          id: `M-${String(Date.now()).slice(-4)}`
        },
        ...lista
      ])
    }

    establecerModal(null)
  }

  return (
    <div className="pila-pagina">
      <div className="encabezado-pagina">
        <div>
          <h1>Directorio médico</h1>
          <p>Especialidades, contacto y disponibilidad.</p>
        </div>
        <button className="accion-principal" type="button" onClick={() => abrir(null)}>
          ＋ Registrar médico
        </button>
      </div>

      <section className="resumen-modulo-grid" aria-label="Resumen médico">
        <article className="resumen-modulo-card">
          <span className="resumen-icono"><Icono name="doctors" size={17} /></span>
          <span>
            <small>Profesionales registrados</small>
            <strong>{medicos.length}</strong>
          </span>
        </article>
        <article className="resumen-modulo-card">
          <span className="resumen-icono"><Icono name="check" size={17} /></span>
          <span>
            <small>Disponibles</small>
            <strong>{medicos.filter((medico) => medico.status === 'Activo').length}</strong>
          </span>
        </article>
        <article className="resumen-modulo-card">
          <span className="resumen-icono"><Icono name="records" size={17} /></span>
          <span>
            <small>Especialidades</small>
            <strong>{especialidades.length}</strong>
          </span>
        </article>
      </section>

      <div className="barra-modulo filtros-medicos">
        <label className="busqueda-pacientes">
          <input
            aria-label="Buscar médico"
            placeholder="Buscar médico o especialidad…"
            value={busqueda}
            onChange={(e) => establecerBusqueda(e.target.value)}
          />
        </label>
        <label>
          Especialidad
          <select value={especialidad} onChange={(e) => establecerEspecialidad(e.target.value)}>
            <option>Todas</option>
            {especialidades.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </div>

      <section className="rejilla-medicos">
        {visibles.map((medico) => (
          <article className="tarjeta-medico" key={medico.id}>
            <div className="encabezado-medico">
              <span className="avatar-medico">
                {medico.name.split(' ').slice(1, 3).map((parte) => parte[0]).join('')}
              </span>
              <button className="boton-texto" type="button" onClick={() => abrir(medico)}>
                Editar
              </button>
            </div>

            <span className="etiqueta-especialidad">{medico.specialty}</span>
            <h2>{medico.name}</h2>
            <p className="texto-secundario">Cédula profesional: {medico.license}</p>
            <p className="texto-secundario">{medico.experience || 0} años de experiencia</p>

            <div className="datos-medico">
              <span>✉ {medico.email}</span>
              <span>☎ {medico.phone}</span>
              <span>◷ {medico.availability}</span>
              <span>Consultorio: {medico.consultationRoom || 'Por asignar'}</span>
              <span>Idiomas: {medico.languages || 'Español'}</span>
            </div>

            <div className="pie-medico">
              <span className={`etiqueta-estado ${medico.status === 'Inactivo' ? 'estado-cancelada' : ''}`}>
                {medico.status}
              </span>
              <button
                type="button"
                onClick={() => establecerMedicos((lista) =>
                  lista.map((m) =>
                    m.id === medico.id
                      ? { ...m, status: m.status === 'Activo' ? 'Inactivo' : 'Activo' }
                      : m
                  )
                )}
              >
                {medico.status === 'Activo' ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </article>
        ))}

        {!visibles.length && (
          <div className="estado-vacio">
            No hay médicos que coincidan con esta búsqueda.
          </div>
        )}
      </section>

      {modal && (
        <ModalFormulario
          titulo={modal === 'nuevo' ? 'Registrar médico' : 'Editar información profesional'}
          descripcion="Información profesional del médico."
          alCerrar={() => establecerModal(null)}
        >
          <form className="formulario-modulo" noValidate onSubmit={guardar}>
            <div className="campos-dos-columnas">
              <label>
                Nombre completo
                <input name="name" defaultValue={formulario.name} onChange={gestionarCambio} aria-invalid={Boolean(errores.name)} />
                {errores.name && <small className="error-campo">{errores.name}</small>}
              </label>

              <label>
                Especialidad
                <input name="specialty" defaultValue={formulario.specialty} onChange={gestionarCambio} aria-invalid={Boolean(errores.specialty)} />
                {errores.specialty && <small className="error-campo">{errores.specialty}</small>}
              </label>

              <label>
                Correo
                <input name="email" type="email" defaultValue={formulario.email} onChange={gestionarCambio} aria-invalid={Boolean(errores.email)} />
                {errores.email && <small className="error-campo">{errores.email}</small>}
              </label>

              <label>
                Teléfono
                <input
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  defaultValue={formulario.phone}
                  onChange={gestionarCambio}
                  aria-invalid={Boolean(errores.phone)}
                />
                {errores.phone && <small className="error-campo">{errores.phone}</small>}
              </label>

              <label>
                Cédula profesional
                <input name="license" defaultValue={formulario.license} />
              </label>

              <label>
                Años de experiencia
                <input name="experience" type="number" min="0" max="60" defaultValue={formulario.experience} onChange={gestionarCambio} aria-invalid={Boolean(errores.experience)} />
                {errores.experience && <small className="error-campo">{errores.experience}</small>}
              </label>

              <label>
                Idiomas de atención
                <input name="languages" placeholder="Español, Inglés" defaultValue={formulario.languages} />
              </label>

              <label>
                Consultorio asignado
                <input name="consultationRoom" placeholder="Consultorio 1" defaultValue={formulario.consultationRoom} />
              </label>

              <label>
                Disponibilidad
                <input name="availability" placeholder="Lun a Vie · 09:00–14:00" defaultValue={formulario.availability} />
              </label>

              <label>
                Estado
                <select name="status" defaultValue={formulario.status}>
                  <option>Activo</option>
                  <option>Inactivo</option>
                </select>
              </label>
            </div>

            <div className="modal-pie interno">
              <button className="boton-secundario" type="button" onClick={() => establecerModal(null)}>
                Cancelar
              </button>
              <button className="accion-principal" type="submit">
                Guardar médico
              </button>
            </div>
          </form>
        </ModalFormulario>
      )}
    </div>
  )
}
