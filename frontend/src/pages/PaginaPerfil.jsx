import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import Icono from '../components/Icono.jsx'
import { useDatosDemostracion } from '../context/useDatosDemostracion.js'
import { normalizarDatosFormulario, validarCorreo, validarTelefono } from '../utilidades/validacionesFormulario.js'

function sacarIniciales(nombre = '') { return nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((parte) => parte[0].toUpperCase()).join('') || 'VC' }

export default function PaginaPerfil() {
  const { user } = useOutletContext()
  const { perfiles, establecerPerfiles, pacientes, establecerPacientes, medicos } = useDatosDemostracion()
  const claveRol = user?.role === 'ADMIN' ? 'admin' : user?.role === 'DOCTOR' ? 'doctor' : 'patient'
  const perfil = perfiles[claveRol]
  const paciente = user?.role === 'PATIENT' ? pacientes.find((elemento) => elemento.id === (user?.patientId ?? 'P-001')) : null
  const medico = user?.role === 'DOCTOR' ? medicos.find((elemento) => elemento.id === (user?.doctorId ?? 'M-001')) : null
  const [mensaje, establecerMensaje] = useState('')
  const [errores, establecerErrores] = useState({})
  const [preview, establecerPreview] = useState(perfil.avatar)
  const iniciales = useMemo(() => sacarIniciales(preview ? '' : perfil.name), [preview, perfil.name])

  function guardar(evento) {
    evento.preventDefault()
    const datos = normalizarDatosFormulario(evento.currentTarget)
    const erroresValidacion = {}
    if (!datos.name) erroresValidacion.name = 'Escribe tu nombre completo.'
    const errorCorreo = validarCorreo(datos.email)
    if (errorCorreo) erroresValidacion.email = errorCorreo
    const errorTelefono = validarTelefono(datos.phone)
    if (errorTelefono) erroresValidacion.phone = errorTelefono
    if (Object.hasOwn(datos, 'emergencyPhone')) {
      const errorTelefonoEmergencia = validarTelefono(datos.emergencyPhone)
      if (errorTelefonoEmergencia) erroresValidacion.emergencyPhone = errorTelefonoEmergencia
    }
    establecerErrores(erroresValidacion)
    if (Object.keys(erroresValidacion).length) return
    establecerPerfiles((actuales) => ({ ...actuales, [claveRol]: { ...actuales[claveRol], ...datos, avatar: preview, recordatorios: datos.recordatorios === 'on', novedades: datos.novedades === 'on' } }))
    if (paciente) {
      const datosPaciente = Object.fromEntries(['name', 'email', 'phone', 'dateOfBirth', 'occupation', 'address', 'emergencyContact', 'emergencyPhone'].map((campo) => [campo, datos[campo] ?? paciente[campo]]))
      establecerPacientes((actuales) => actuales.map((elemento) => elemento.id === paciente.id ? { ...elemento, ...datosPaciente } : elemento))
    }
    establecerMensaje('Perfil actualizado correctamente.')
  }

  function gestionarCambio(evento) {
    const { name, value } = evento.target
    if (!['name', 'email', 'phone', 'emergencyPhone'].includes(name)) return
    establecerMensaje('')
    const error = name === 'name' ? value.trim() ? '' : 'Escribe tu nombre completo.' : name === 'email' ? value.trim() ? validarCorreo(value) : errores.email ? 'Escribe tu correo electrónico.' : '' : validarTelefono(value)
    establecerErrores((actuales) => ({ ...actuales, [name]: error }))
  }

  function leerFoto(evento) {
    const archivo = evento.target.files?.[0]
    if (!archivo) return
    if (!archivo.type.startsWith('image/')) { establecerMensaje('Selecciona un archivo de imagen.'); return }
    const lector = new FileReader()
    lector.onload = () => { establecerPreview(lector.result); establecerMensaje('Vista previa de fotografía lista.') }
    lector.readAsDataURL(archivo)
  }

  return <div className="pila-pagina">
    <div className="encabezado-pagina"><div><h1>Mi perfil</h1><p>Información personal, contacto y preferencias de cuenta.</p></div></div>
    <form className="tarjeta-contenido formulario-perfil" noValidate onSubmit={guardar}>
      <div className="encabezado-seccion"><div className="encabezado-seccion-icono"><span className="icono-seccion-cielo"><Icono name="profile" size={18} /></span><div><h2>Información personal</h2><p>Actualiza tus datos y preferencias</p></div></div></div>
      <div className="editor-avatar"><div className="avatar-perfil">{preview ? <img src={preview} alt="Fotografía de perfil" /> : iniciales}</div><label className="boton-secundario boton-archivo">Cambiar fotografía<input type="file" accept="image/*" onChange={leerFoto} /></label><span>Imagen de perfil</span></div>
      <fieldset className="grupo-campos-clinicos"><legend>Datos de cuenta</legend><div className="campos-dos-columnas perfil-campos"><label>Nombre completo<input name="name" defaultValue={perfil.name} onChange={gestionarCambio} aria-invalid={Boolean(errores.name)} />{errores.name && <small className="error-campo">{errores.name}</small>}</label><label>Correo electrónico<input name="email" type="email" defaultValue={perfil.email} onChange={gestionarCambio} aria-invalid={Boolean(errores.email)} />{errores.email && <small className="error-campo">{errores.email}</small>}</label><label>Teléfono<input name="phone" type="tel" inputMode="numeric" defaultValue={paciente?.phone ?? perfil.phone} onChange={gestionarCambio} aria-invalid={Boolean(errores.phone)} />{errores.phone && <small className="error-campo">{errores.phone}</small>}</label><label>Rol de cuenta<input value={user?.roleLabel ?? 'Usuario'} readOnly /></label>{user?.role === 'ADMIN' && <label>Área de trabajo<input name="department" defaultValue={perfil.department ?? 'Administración'} /></label>}{medico && <><label>Especialidad<input value={medico.specialty} readOnly /></label><label>Cédula profesional<input value={medico.license} readOnly /></label><label>Consultorio<input value={medico.consultationRoom ?? 'Por asignar'} readOnly /></label><label>Disponibilidad<input value={medico.availability} readOnly /></label></>}</div></fieldset>
      {paciente && <fieldset className="grupo-campos-clinicos"><legend>Información de contacto</legend><div className="campos-dos-columnas perfil-campos"><label>Fecha de nacimiento<input name="dateOfBirth" type="date" defaultValue={paciente.dateOfBirth} /></label><label>Ocupación<input name="occupation" defaultValue={paciente.occupation} /></label><label className="ancho-completo">Domicilio<input name="address" defaultValue={paciente.address} /></label><label>Contacto de emergencia<input name="emergencyContact" defaultValue={paciente.emergencyContact} /></label><label>Teléfono de emergencia<input name="emergencyPhone" type="tel" inputMode="numeric" defaultValue={paciente.emergencyPhone} onChange={gestionarCambio} aria-invalid={Boolean(errores.emergencyPhone)} />{errores.emergencyPhone && <small className="error-campo">{errores.emergencyPhone}</small>}</label><div className="dato-perfil-salud"><span>Tipo de sangre</span><strong>{paciente.bloodType || 'Sin registrar'}</strong></div><div className="dato-perfil-salud"><span>Seguro médico</span><strong>{paciente.insurance || 'Sin registrar'}</strong></div></div></fieldset>}
      <div className="opciones-cuenta"><label><input name="recordatorios" type="checkbox" defaultChecked={perfil.recordatorios} /> Recibir recordatorios de citas</label><label><input name="novedades" type="checkbox" defaultChecked={perfil.novedades} /> Avisarme de novedades del sistema</label></div>
      {mensaje && <p className="mensaje-exito" role="status">{mensaje}</p>}
      <div className="acciones-perfil"><button className="accion-principal" type="submit">Guardar cambios</button></div>
    </form>
  </div>
}
