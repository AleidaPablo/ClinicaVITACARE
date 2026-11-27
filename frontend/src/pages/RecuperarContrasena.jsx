import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosClient from '../config/axiosClient'
import fotoInicio from '../assets/foto-consulta.png'
import { validarCorreo } from '../utilidades/validacionesFormulario.js'

function MarcaRecuperacion() {
  return (
    <div className="marca" aria-label="VITACARE">
      <span className="marca-icono" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" fill="currentColor" />
        </svg>
      </span>
      <span className="nombre-marca">VITACARE</span>
    </div>
  )
}

function IconoCorreo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4.5 7 7.5 6 7.5-6" />
    </svg>
  )
}

export default function RecuperarContrasena() {
  const navigate = useNavigate()
  const [correo, establecerCorreo] = useState('')
  const [errorCorreo, establecerErrorCorreo] = useState('')
  const [enviando, establecerEnviando] = useState(false)

  async function gestionarEnvio(event) {
    event.preventDefault()
    const error = validarCorreo(correo)
    establecerErrorCorreo(error)
    if (error) return

    establecerEnviando(true)
    try {
      await axiosClient.post('/autenticacion/recuperar-contrasena', { email: correo.trim() })
      navigate('/revisa-correo', { state: { correo: correo.trim() } })
    } catch (err) {
      establecerErrorCorreo(
        err.response
          ? err.response.data?.mensaje || err.response.data?.email || 'No se pudo enviar el enlace. Intenta de nuevo.'
          : 'No hay conexión con el servidor. Revisa tu internet e intenta de nuevo.'
      )
    } finally {
      establecerEnviando(false)
    }
  }

  return (
    <main className="pantalla-inicio">
      <aside
        className="visual-inicio"
        style={{ '--foto-inicio': `url("${fotoInicio}")` }}
        aria-label="Consulta médica"
      >
        <div className="contenido-visual-inicio">
          <MarcaRecuperacion />
          <div className="separador-visual" />
        </div>
      </aside>

      <section className="panel-inicio" aria-labelledby="recuperacion-title">
        <div className="tarjeta-inicio tarjeta-recuperacion">
          <div className="marca-movil"><MarcaRecuperacion /></div>
          <header className="encabezado-inicio">
            <h1 id="recuperacion-title">¿Olvidaste tu contraseña?</h1>
            <p>Te enviaremos un enlace seguro para recuperar el acceso a tu cuenta.</p>
          </header>

          <form className="formulario-inicio formulario-recuperacion" noValidate onSubmit={gestionarEnvio}>
            <div className="campo-formulario">
              <label htmlFor="correo-recuperacion">Correo electrónico</label>
              <div className={`contenedor-entrada${errorCorreo ? ' tiene-error' : ''}`}>
                <IconoCorreo />
                <input
                  id="correo-recuperacion"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="correo@ejemplo.com"
                  value={correo}
                  aria-invalid={Boolean(errorCorreo)}
                  aria-describedby={errorCorreo ? 'correo-recuperacion-error' : undefined}
                  onChange={(event) => {
                    const valor = event.target.value
                    establecerCorreo(valor)
                    establecerErrorCorreo(valor.trim() ? validarCorreo(valor) : errorCorreo ? 'Escribe tu correo electrónico.' : '')
                  }}
                />
              </div>
              {errorCorreo && <p className="error-campo" id="correo-recuperacion-error">{errorCorreo}</p>}
            </div>

            <button className="boton-iniciar" type="submit" disabled={enviando}>
              {enviando ? 'Enviando…' : <>Enviar enlace <span aria-hidden="true">→</span></>}
            </button>
            <Link className="enlace-regreso-recuperacion" to="/login">
              Volver al inicio de sesión
            </Link>
          </form>
        </div>
      </section>
    </main>
  )
}