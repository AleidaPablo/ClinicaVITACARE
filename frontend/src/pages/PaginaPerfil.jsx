
import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import Icono from '../components/Icono.jsx'
import { useDatosDemostracion } from '../context/useDatosDemostracion.js'
import {
  normalizarDatosFormulario,
  validarCorreo,
  validarTelefono
} from '../utilidades/validacionesFormulario.js'
import axiosClient from '../config/axiosClient'

function sacarIniciales(nombre = '') {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join('') || 'VC'
}

export default function PaginaPerfil() {
  const { user, modoDemostracion } = useOutletContext()

  const {
    perfiles,
    establecerPerfiles,
    pacientes,
    establecerPacientes,
    medicos
  } = useDatosDemostracion()

  const esModoReal = modoDemostracion === false

  const claveRol =
    user?.role === 'ADMIN'
      ? 'admin'
      : user?.role === 'DOCTOR'
        ? 'doctor'
        : 'patient'

  const [perfilReal, setPerfilReal] = useState(null)
  const [cargando, setCargando] = useState(esModoReal)
  const [mensaje, establecerMensaje] = useState('')
  const [errorServidor, setErrorServidor] = useState('')
  const [errores, establecerErrores] = useState({})

  // Estado de fotografía de perfil
  const [preview, setPreview] = useState('')

  // Cargar perfil desde el backend
  const cargarPerfil = async () => {
    if (!esModoReal) return

    setCargando(true)
    setErrorServidor('')

    try {
      const res = await axiosClient.get('/usuarios/me')

      setPerfilReal(res.data)
      setPreview(res.data.fotoUrl || '')

    } catch (err) {
      console.error('Error al cargar perfil:', err)

      setErrorServidor(
        err.response?.data?.mensaje ||
        'Error al conectar con el servidor para cargar el perfil.'
      )

    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarPerfil()
  }, [esModoReal])

  // Datos para modo demostración
  const perfilDemo = perfiles[claveRol]

  const pacienteDemo =
    user?.role === 'PATIENT'
      ? pacientes.find(
          (el) => el.id === (user?.patientId ?? 'P-001')
        )
      : null

  const medicoDemo =
    user?.role === 'DOCTOR'
      ? medicos.find(
          (el) => el.id === (user?.doctorId ?? 'M-001')
        )
      : null

  // Fusión según el modo
  const nombreUsuario = esModoReal
    ? (perfilReal?.nombreCompleto || user?.name || '')
    : perfilDemo.name

  const emailUsuario = esModoReal
    ? (perfilReal?.email || user?.email || '')
    : perfilDemo.email

  const telefonoUsuario = esModoReal
    ? (perfilReal?.telefono || '')
    : (pacienteDemo?.phone ?? perfilDemo.phone)

  const departamentoUsuario = esModoReal
    ? (perfilReal?.departamento || '')
    : (perfilDemo.department ?? 'Administración')

  // Datos paciente
  const esPaciente = user?.role === 'PATIENT'

  const fechaNacimiento = esModoReal
    ? (perfilReal?.fechaNacimiento || '')
    : (pacienteDemo?.dateOfBirth || '')

  const ocupacion = esModoReal
    ? (perfilReal?.ocupacion || '')
    : (pacienteDemo?.occupation || '')

  const direccion = esModoReal
    ? (perfilReal?.direccion || '')
    : (pacienteDemo?.address || '')

  const contactoEmergencia = esModoReal
    ? (perfilReal?.contactoEmergenciaNombre || '')
    : (pacienteDemo?.emergencyContact || '')

  const telefonoEmergencia = esModoReal
    ? (perfilReal?.contactoEmergenciaTelefono || '')
    : (pacienteDemo?.emergencyPhone || '')

  const tipoSangre = esModoReal
    ? (perfilReal?.tipoSangre || 'Sin registrar')
    : (pacienteDemo?.bloodType || 'Sin registrar')

  const seguroMedico = esModoReal
    ? (perfilReal?.tipoSeguro || 'Sin registrar')
    : (pacienteDemo?.insurance || 'Sin registrar')

  // Datos médico
  const esMedico = user?.role === 'DOCTOR'

  const especialidad = esModoReal
    ? (perfilReal?.especialidad || 'Medicina General')
    : (medicoDemo?.specialty || 'Medicina General')

  const cedula = esModoReal
    ? (perfilReal?.cedulaProfesional || '')
    : (medicoDemo?.license || '')

  const consultorio = esModoReal
    ? (perfilReal?.consultorio || 'Por asignar')
    : (medicoDemo?.consultationRoom ?? 'Por asignar')

  const disponibilidad = esModoReal
    ? (perfilReal?.disponibilidad || 'Sin definir')
    : (medicoDemo?.availability || '')

  const iniciales = useMemo(
    () => sacarIniciales(preview ? '' : nombreUsuario),
    [preview, nombreUsuario]
  )

  // Guardar cambios
  async function guardar(evento) {
    evento.preventDefault()

    establecerMensaje('')
    setErrorServidor('')

    const datos = normalizarDatosFormulario(evento.currentTarget)

    const erroresValidacion = {}

    if (!datos.name) {
      erroresValidacion.name = 'Escribe tu nombre completo.'
    }

    if (datos.phone) {
      const errorTelefono = validarTelefono(datos.phone)

      if (errorTelefono) {
        erroresValidacion.phone = errorTelefono
      }
    }

    if (
      Object.hasOwn(datos, 'emergencyPhone') &&
      datos.emergencyPhone
    ) {
      const errorTelefonoEmergencia =
        validarTelefono(datos.emergencyPhone)

      if (errorTelefonoEmergencia) {
        erroresValidacion.emergencyPhone =
          errorTelefonoEmergencia
      }
    }

    establecerErrores(erroresValidacion)

    if (Object.keys(erroresValidacion).length) return

    // Modo real: guardar en base de datos
    if (esModoReal) {
      const payload = {
        nombreCompleto: datos.name,
        telefono: datos.phone || '',
        departamento: datos.department || '',
        fotoUrl: preview || '',
        fechaNacimiento: datos.dateOfBirth || null,
        ocupacion: datos.occupation || '',
        direccion: datos.address || '',
        contactoEmergenciaNombre: datos.emergencyContact || '',
        contactoEmergenciaTelefono: datos.emergencyPhone || ''
      }

      try {
        const res = await axiosClient.put(
          '/usuarios/me',
          payload
        )

        setPerfilReal(res.data)
        setPreview(res.data.fotoUrl || preview)

        establecerMensaje(
          'Perfil actualizado correctamente en la base de datos.'
        )

      } catch (err) {
        console.error(
          'Error al actualizar perfil en BD:',
          err
        )

        setErrorServidor(
          err.response?.data?.mensaje ||
          err.response?.data?.message ||
          'Error al actualizar el perfil.'
        )
      }

    } else {
      // Modo demostración
      establecerPerfiles((actuales) => ({
        ...actuales,

        [claveRol]: {
          ...actuales[claveRol],
          ...datos,
          avatar: preview,
          recordatorios: datos.recordatorios === 'on',
          novedades: datos.novedades === 'on'
        }
      }))

      if (pacienteDemo) {
        const datosPaciente = Object.fromEntries(
          [
            'name',
            'email',
            'phone',
            'dateOfBirth',
            'occupation',
            'address',
            'emergencyContact',
            'emergencyPhone'
          ].map((campo) => [
            campo,
            datos[campo] ?? pacienteDemo[campo]
          ])
        )

        establecerPacientes((actuales) =>
          actuales.map((el) =>
            el.id === pacienteDemo.id
              ? { ...el, ...datosPaciente }
              : el
          )
        )
      }

      establecerMensaje('Perfil actualizado correctamente.')
    }
  }

  // Validación de campos
  function gestionarCambio(evento) {
    const { name, value } = evento.target

    if (
      !['name', 'email', 'phone', 'emergencyPhone'].includes(name)
    ) return

    establecerMensaje('')

    const error =
      name === 'name'
        ? value.trim()
          ? ''
          : 'Escribe tu nombre completo.'
        : name === 'email'
          ? value.trim()
            ? validarCorreo(value)
            : errores.email
              ? 'Escribe tu correo electrónico.'
              : ''
          : validarTelefono(value)

    establecerErrores((actuales) => ({
      ...actuales,
      [name]: error
    }))
  }

  // Seleccionar fotografía
  function leerFoto(evento) {
    const archivo = evento.target.files?.[0]

    if (!archivo) return

    if (!archivo.type.startsWith('image/')) {
      establecerMensaje('Selecciona un archivo de imagen.')
      return
    }

    const lector = new FileReader()

    lector.onload = () => {
      setPreview(lector.result)
      establecerMensaje('Vista previa de fotografía lista.')
    }

    lector.readAsDataURL(archivo)
  }

  // Estado de carga
  if (cargando) {
    return (
      <div className="pila-pagina">
        <div className="estado-vacio">
          Cargando tu información de perfil desde la base de datos…
        </div>
      </div>
    )
  }

  return (
    <div className="pila-pagina">

      <div className="encabezado-pagina">
        <div>
          <h1>Mi perfil</h1>
          <p>
            Información personal, contacto y preferencias de cuenta.
          </p>
        </div>
      </div>

      <form
        className="tarjeta-contenido formulario-perfil"
        noValidate
        onSubmit={guardar}
      >

        <div className="encabezado-seccion">
          <div className="encabezado-seccion-icono">
            <span className="icono-seccion-cielo">
              <Icono name="profile" size={18} />
            </span>

            <div>
              <h2>Información personal</h2>
              <p>Actualiza tus datos y preferencias</p>
            </div>
          </div>
        </div>

        {/* Fotografía de perfil */}
        <div className="editor-avatar">

          <div className="avatar-perfil">
            {preview ? (
              <img
                src={preview}
                alt="Fotografía de perfil"
              />
            ) : (
              iniciales
            )}
          </div>

          <label className="boton-secundario boton-archivo">
            Cambiar fotografía

            <input
              type="file"
              accept="image/*"
              onChange={leerFoto}
            />
          </label>

          <span>Imagen de perfil</span>
        </div>

        {/* Datos de cuenta */}
        <fieldset className="grupo-campos-clinicos">
          <legend>Datos de cuenta</legend>

          <div className="campos-dos-columnas perfil-campos">

            <label>
              Nombre completo

              <input
                name="name"
                defaultValue={nombreUsuario}
                onChange={gestionarCambio}
                aria-invalid={Boolean(errores.name)}
              />

              {errores.name && (
                <small className="error-campo">
                  {errores.name}
                </small>
              )}
            </label>

            <label>
              Correo electrónico

              <input
                name="email"
                type="email"
                value={emailUsuario}
                readOnly
                title="El correo es tu usuario de acceso"
              />
            </label>

            <label>
              Teléfono

              <input
                name="phone"
                type="tel"
                inputMode="numeric"
                defaultValue={telefonoUsuario}
                onChange={gestionarCambio}
                aria-invalid={Boolean(errores.phone)}
              />

              {errores.phone && (
                <small className="error-campo">
                  {errores.phone}
                </small>
              )}
            </label>

            <label>
              Rol de cuenta

              <input
                value={
                  user?.roleLabel ??
                  user?.role ??
                  'Usuario'
                }
                readOnly
              />
            </label>

            {user?.role === 'ADMIN' && (
              <label>
                Área de trabajo

                <input
                  name="department"
                  defaultValue={departamentoUsuario}
                />
              </label>
            )}

            {esMedico && (
              <>
                <label>
                  Especialidad
                  <input value={especialidad} readOnly />
                </label>

                <label>
                  Cédula profesional
                  <input value={cedula} readOnly />
                </label>

                <label>
                  Consultorio
                  <input value={consultorio} readOnly />
                </label>

                <label>
                  Disponibilidad
                  <input value={disponibilidad} readOnly />
                </label>
              </>
            )}

          </div>
        </fieldset>

        {/* Información del paciente */}
        {esPaciente && (
          <fieldset className="grupo-campos-clinicos">
            <legend>Información de contacto</legend>

            <div className="campos-dos-columnas perfil-campos">

              <label>
                Fecha de nacimiento

                <input
                  name="dateOfBirth"
                  type="date"
                  defaultValue={fechaNacimiento}
                />
              </label>

              <label>
                Ocupación

                <input
                  name="occupation"
                  defaultValue={ocupacion}
                />
              </label>

              <label className="ancho-completo">
                Domicilio

                <input
                  name="address"
                  defaultValue={direccion}
                />
              </label>

              <label>
                Contacto de emergencia

                <input
                  name="emergencyContact"
                  defaultValue={contactoEmergencia}
                />
              </label>

              <label>
                Teléfono de emergencia

                <input
                  name="emergencyPhone"
                  type="tel"
                  inputMode="numeric"
                  defaultValue={telefonoEmergencia}
                  onChange={gestionarCambio}
                  aria-invalid={Boolean(errores.emergencyPhone)}
                />

                {errores.emergencyPhone && (
                  <small className="error-campo">
                    {errores.emergencyPhone}
                  </small>
                )}
              </label>

              <div className="dato-perfil-salud">
                <span>Tipo de sangre</span>
                <strong>{tipoSangre}</strong>
              </div>

              <div className="dato-perfil-salud">
                <span>Seguro médico</span>
                <strong>{seguroMedico}</strong>
              </div>

            </div>
          </fieldset>
        )}

        {/* Preferencias de cuenta */}
        <div className="opciones-cuenta">

          <label>
            <input
              name="recordatorios"
              type="checkbox"
              defaultChecked
            />
            Recibir recordatorios de citas
          </label>

          <label>
            <input
              name="novedades"
              type="checkbox"
              defaultChecked
            />
            Avisarme de novedades del sistema
          </label>

        </div>

        {/* Mensajes */}
        {mensaje && (
          <p className="mensaje-exito" role="status">
            {mensaje}
          </p>
        )}

        {errorServidor && (
          <p
            style={{ color: '#b42318', margin: '10px 0' }}
            role="alert"
          >
            {errorServidor}
          </p>
        )}

        {/* Botón guardar */}
        <div className="acciones-perfil">
          <button
            className="accion-principal"
            type="submit"
          >
            Guardar cambios
          </button>
        </div>

      </form>
    </div>
  )
}
