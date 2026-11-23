
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import Icono from '../components/Icono.jsx'
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
  const { user } = useOutletContext()

  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [mensaje, establecerMensaje] = useState('')
  const [errorServidor, setErrorServidor] = useState('')
  const [errores, establecerErrores] = useState({})


  const [preview, setPreview] = useState('')


  const cargarPerfil = useCallback(async (signal) => {
    setCargando(true)
    setErrorServidor('')

    try {
      const res = await axiosClient.get('/usuarios/me', { signal })

      if (signal?.aborted) return
      setPerfil(res.data)
      setPreview(res.data.fotoUrl || '')

    } catch (err) {
      if (signal?.aborted) return
      console.error('Error al cargar perfil:', err)

      setErrorServidor(
        err.response?.data?.mensaje ||
        'Error al conectar con el servidor para cargar el perfil.'
      )

    } finally {
      if (!signal?.aborted) setCargando(false)
    }
  }, [])

  useEffect(() => {
    const controlador = new AbortController()
    Promise.resolve().then(() => {
      if (!controlador.signal.aborted) cargarPerfil(controlador.signal)
    })
    return () => controlador.abort()
  }, [cargarPerfil])

 
  const nombreUsuario = (perfil?.nombreCompleto || user?.name || '')

  const emailUsuario = (perfil?.email || user?.email || '')

  const telefonoUsuario = (perfil?.telefono || '')

  const departamentoUsuario = (perfil?.departamento || '')

  
  const esPaciente = user?.role === 'PATIENT'

  const fechaNacimiento = (perfil?.fechaNacimiento || '')

  const ocupacion = (perfil?.ocupacion || '')

  const direccion = (perfil?.direccion || '')

  const contactoEmergencia = (perfil?.contactoEmergenciaNombre || '')

  const telefonoEmergencia = (perfil?.contactoEmergenciaTelefono || '')

  const tipoSangre = (perfil?.tipoSangre || 'Sin registrar')

  const seguroMedico = (perfil?.tipoSeguro || 'Sin registrar')

  
  const esMedico = user?.role === 'DOCTOR'

  const especialidad = (perfil?.especialidad || 'Medicina General')

  const cedula = (perfil?.cedulaProfesional || '')

  const consultorio = (perfil?.consultorio || 'Por asignar')

  const disponibilidad = (perfil?.disponibilidad || 'Sin definir')

  const iniciales = useMemo(
    () => sacarIniciales(preview ? '' : nombreUsuario),
    [preview, nombreUsuario]
  )

  
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
      const res = await axiosClient.put('/usuarios/me', payload)

      setPerfil(res.data)
      setPreview(res.data.fotoUrl || preview)

      establecerMensaje('Perfil actualizado correctamente.')
    } catch (err) {
      console.error('Error al actualizar perfil:', err)

      setErrorServidor(
        err.response?.data?.mensaje ||
        err.response?.data?.message ||
        'Error al actualizar el perfil.'
      )
    }
  }

  
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


  if (cargando) {
    return (
      <div className="pila-pagina">
        <div className="estado-vacio">
          Cargando tu información de perfil…
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
