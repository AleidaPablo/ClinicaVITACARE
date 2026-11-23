import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import fotoInicio from '../assets/foto-consulta.png'
import { validarCorreo } from '../utilidades/validacionesFormulario.js'

function Marca() {
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

function MailIcono() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4.5 7 7.5 6 7.5-6" />
    </svg>
  )
}

function LockIcono() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="4.5" y="10" width="15" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" />
    </svg>
  )
}

function VisibilityIcono({ visible }) {
  return visible ? (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M3 3 21 21M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5.3 0 9 5 9 7a8.9 8.9 0 0 1-2.4 3.5M6.2 6.2C3.9 7.7 3 9.9 3 12c0 2 3.7 7 9 7 1.2 0 2.3-.2 3.3-.7" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M3 12s3.2-7 9-7 9 7 9 7-3.2 7-9 7-9-7-9-7Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  )
}

function validarCredenciales(email, password) {
  const errors = {}
  const errorCorreo = validarCorreo(email)
  if (errorCorreo) errors.email = errorCorreo.replace('Escribe', 'Ingresa')

  if (!String(password ?? '').trim()) errors.password = 'Ingresa tu contraseña.'

  return errors
}

export default function InicioSesion({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mostrarContrasena, setShowPassword] = useState(false)
  const [recordarSesion, setRememberMe] = useState(true)
  const [erroresCampos, setFieldErrors] = useState({})
  const [errorFormulario, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const [estaEnviando, setIsSubmitting] = useState(false)
  const entradaCorreo = useRef(null)
  const entradaContrasena = useRef(null)

  async function gestionarEnvio(event) {
    event.preventDefault()
    setFormError('')
    setNotice('')

    const erroresValidacion = validarCredenciales(email, password)
    setFieldErrors(erroresValidacion)

    if (Object.keys(erroresValidacion).length > 0) {
      if (erroresValidacion.email) entradaCorreo.current?.focus()
      else entradaContrasena.current?.focus()
      return
    }

    if (!onLogin) {
      setNotice('El acceso se habilitará al conectar el servicio de autenticación.')
      return
    }

    setIsSubmitting(true)
    try {
      await onLogin({ email: email.trim(), password, recordarSesion })
    } catch (error) {
      setFormError(error?.message || 'No fue posible iniciar sesión. Intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
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
          <Marca />
          <div className="separador-visual" />
        </div>
      </aside>

      <section className="panel-inicio" aria-labelledby="login-title">
        <div className="tarjeta-inicio">
          <div className="marca-movil"><Marca /></div>
          <header className="encabezado-inicio">
            <h1 id="login-title">Bienvenida de nuevo</h1>
            <p>Tu clínica en un solo lugar.</p>
          </header>

          <form className="formulario-inicio" noValidate onSubmit={gestionarEnvio}>
            <div className="campo-formulario">
              <label htmlFor="login-email">Correo electrónico</label>
              <div className={`contenedor-entrada${erroresCampos.email ? ' tiene-error' : ''}`}>
                <MailIcono />
                <input
                  ref={entradaCorreo}
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  aria-invalid={Boolean(erroresCampos.email)}
                  aria-describedby={erroresCampos.email ? 'email-error' : undefined}
                  onChange={(event) => {
                    const valor = event.target.value
                    setEmail(valor)
                    setFieldErrors((current) => ({ ...current, email: valor.trim() ? validarCorreo(valor).replace('Escribe', 'Ingresa') : current.email ? 'Ingresa tu correo electrónico.' : '' }))
                  }}
                />
              </div>
              {erroresCampos.email && <p className="error-campo" id="email-error">{erroresCampos.email}</p>}
            </div>

            <div className="campo-formulario">
              <label htmlFor="login-password">Contraseña</label>
              <div className={`contenedor-entrada${erroresCampos.password ? ' tiene-error' : ''}`}>
                <LockIcono />
                <input
                  ref={entradaContrasena}
                  id="login-password"
                  name="password"
                  type={mostrarContrasena ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  aria-invalid={Boolean(erroresCampos.password)}
                  aria-describedby={erroresCampos.password ? 'password-ayuda password-error' : 'password-ayuda'}
                  onChange={(event) => {
                    const valor = event.target.value
                    setPassword(valor)
                    setFieldErrors((current) => ({
                      ...current,
                      password: valor.trim() ? '' : current.password ? 'Ingresa tu contraseña.' : '',
                    }))
                  }}
                />
                <button
                  className="alternar-visibilidad"
                  type="button"
                  aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={mostrarContrasena}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  <VisibilityIcono visible={mostrarContrasena} />
                </button>
              </div>
              <p className="ayuda-contrasena" id="password-ayuda">Ingresa la contraseña de tu cuenta.</p>
              {erroresCampos.password && <p className="error-campo" id="password-error">{erroresCampos.password}</p>}
            </div>

            <div className="opciones-inicio">
              <label className="opcion-recordar" htmlFor="remember-me">
                <input
                  id="remember-me"
                  name="recordarSesion"
                  type="checkbox"
                  checked={recordarSesion}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <span>Recordar mi sesión</span>
              </label>
              <Link className="boton-texto" to="/recuperar-contrasena">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {errorFormulario && <p className="mensaje-formulario mensaje-error" role="alert">{errorFormulario}</p>}
            {notice && <p className="mensaje-formulario mensaje-informacion" role="status">{notice}</p>}

            <button className="boton-iniciar" type="submit" disabled={estaEnviando}>
              {estaEnviando ? <><span className="indicador-carga" aria-hidden="true" /> Iniciando sesión...</> : <>Entrar al sistema <span aria-hidden="true">→</span></>}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
