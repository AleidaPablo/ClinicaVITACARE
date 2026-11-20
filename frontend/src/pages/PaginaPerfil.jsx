import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useDatosDemostracion } from '../ContextoDatosDemostracion.jsx'

function sacarIniciales(nombre = '') { return nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((parte) => parte[0].toUpperCase()).join('') || 'VC' }

export default function PaginaPerfil() {
  const { user } = useOutletContext()
  const { perfiles, establecerPerfiles } = useDatosDemostracion()
  const claveRol = user?.role === 'ADMIN' ? 'admin' : user?.role === 'DOCTOR' ? 'doctor' : 'patient'
  const perfil = perfiles[claveRol]
  const [mensaje, establecerMensaje] = useState('')
  const [preview, establecerPreview] = useState(perfil.avatar)
  const iniciales = useMemo(() => sacarIniciales(preview ? '' : perfil.name), [preview, perfil.name])
  function guardar(evento) { evento.preventDefault(); const datos = Object.fromEntries(new FormData(evento.currentTarget)); establecerPerfiles((actuales) => ({ ...actuales, [claveRol]: { ...actuales[claveRol], ...datos, avatar: preview, recordatorios: datos.recordatorios === 'on', novedades: datos.novedades === 'on' } })); establecerMensaje('Cambios aplicados solo a esta sesión de demostración.') }
  function leerFoto(evento) { const archivo = evento.target.files?.[0]; if (!archivo) return; if (!archivo.type.startsWith('image/')) { establecerMensaje('Selecciona un archivo de imagen.'); return } const lector = new FileReader(); lector.onload = () => { establecerPreview(lector.result); establecerMensaje('Vista previa lista. Guarda el perfil para verla en esta sesión.') }; lector.readAsDataURL(archivo) }

  return <div className="pila-pagina"><div className="encabezado-pagina"><div><h1>Mi perfil</h1><p>Información personal y preferencias de cuenta.</p></div></div><p className="nota-datos-demo">Las preferencias y la imagen solo se mantienen temporalmente en esta demostración.</p><form className="tarjeta-contenido formulario-perfil" onSubmit={guardar}><div className="encabezado-seccion"><div><h2>Información personal</h2><p>Actualiza los datos visibles de tu perfil</p></div></div><div className="editor-avatar"><div className="avatar-perfil">{preview ? <img src={preview} alt="Vista previa del avatar" /> : iniciales}</div><label className="boton-secundario boton-archivo">Cambiar fotografía<input type="file" accept="image/*" onChange={leerFoto} /></label><span>Imagen opcional · vista local</span></div><div className="campos-dos-columnas perfil-campos"><label>Nombre completo<input name="name" defaultValue={perfil.name} required /></label><label>Correo electrónico<input name="email" type="email" defaultValue={perfil.email} required /></label><label>Teléfono<input name="phone" defaultValue={perfil.phone} /></label><label>Rol de cuenta<input value={user?.roleLabel ?? 'Usuario'} readOnly /></label></div><div className="opciones-cuenta"><label><input name="recordatorios" type="checkbox" defaultChecked={perfil.recordatorios} /> Recibir recordatorios de citas</label><label><input name="novedades" type="checkbox" defaultChecked={perfil.novedades} /> Avisarme de novedades del sistema</label></div>{mensaje && <p className="mensaje-exito" role="status">{mensaje}</p>}<div className="acciones-perfil"><button className="accion-principal" type="submit">Guardar cambios en demostración</button></div></form></div>
}
