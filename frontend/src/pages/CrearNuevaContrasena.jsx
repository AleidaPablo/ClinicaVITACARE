import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import fotoInicio from '../assets/foto-consulta.png'
import { validarContrasena } from '../utilidades/validacionesFormulario.js'

function MarcaRestablecimiento() {
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

function IconoCandado() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="4.5" y="10" width="15" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" />
    </svg>
  )
}

function IconoVisibilidad({ visible }) {
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

export default function CrearNuevaContrasena() {
  const navigate = useNavigate()
  const [contrasena, establecerContrasena] = useState('')
  const [confirmacion, establecerConfirmacion] = useState('')
  const [mostrarContrasena, establecerVisibilidadContrasena] = useState(false)
  const [mostrarConfirmacion, establecerVisibilidadConfirmacion] = useState(false)
  const [errores, establecerErrores] = useState({})

  function gestionarEnvio(event) {
    event.preventDefault()
    const erroresValidacion = {}
    const errorContrasena = validarContrasena(contrasena)
    if (errorContrasena) erroresValidacion.contrasena = errorContrasena
    if (!confirmacion) erroresValidacion.confirmacion = 'Confirma tu contraseña.'
    else if (contrasena !== confirmacion) erroresValidacion.confirmacion = 'Las contraseñas no coinciden.'
    establecerErrores(erroresValidacion)
    if (!Object.keys(erroresValidacion).length) navigate('/login')
  }

  return (
    <main className="pantalla-inicio">
      <aside
        className="visual-inicio"
        style={{ '--foto-inicio': `url("${fotoInicio}")` }}
        aria-label="Consulta médica"
      >
        <div className="contenido-visual-inicio">
          <MarcaRestablecimiento />
          <div className="separador-visual" />
        </div>
      </aside>

      <section className="panel-inicio" aria-labelledby="nueva-contrasena-title">
        <div className="tarjeta-inicio tarjeta-recuperacion tarjeta-nueva-contrasena">
          <div className="marca-movil"><MarcaRestablecimiento /></div>
          <header className="encabezado-inicio">
            <h1 id="nueva-contrasena-title">Crea una nueva contraseña</h1>
            <p>Protege tu cuenta con una contraseña única y segura.</p>
          </header>

          <form className="formulario-inicio formulario-recuperacion" noValidate onSubmit={gestionarEnvio}>
            <div className="campo-formulario">
              <label htmlFor="nueva-contrasena">Nueva contraseña</label>
              <div className={`contenedor-entrada${errores.contrasena ? ' tiene-error' : ''}`}>
                <IconoCandado />
                <input
                  id="nueva-contrasena"
                  name="nuevaContrasena"
                  type={mostrarContrasena ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Ingresa tu contraseña"
                  value={contrasena}
                  
                  aria-invalid={Boolean(errores.contrasena)}
                  aria-describedby={errores.contrasena ? 'nueva-contrasena-error' : 'ayuda-contrasena'}
                  onChange={(event) => {
                    const valor = event.target.value
                    establecerContrasena(valor)
                    const error = valor ? validarContrasena(valor) : errores.contrasena ? 'Ingresa una contraseña.' : ''
                    establecerErrores((actuales) => ({ ...actuales, contrasena: error, confirmacion: confirmacion ? valor !== confirmacion ? 'Las contraseñas no coinciden.' : '' : actuales.confirmacion ? 'Confirma tu contraseña.' : '' }))
                  }}
                />
                <button
                  className="alternar-visibilidad"
                  type="button"
                  aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={mostrarContrasena}
                  onClick={() => establecerVisibilidadContrasena((actual) => !actual)}
                >
                  <IconoVisibilidad visible={mostrarContrasena} />
                </button>
              </div>
              {errores.contrasena && <p className="error-campo" id="nueva-contrasena-error">{errores.contrasena}</p>}
            </div>

            <div className="campo-formulario">
              <label htmlFor="confirmar-contrasena">Confirmar contraseña</label>
              <div className={`contenedor-entrada${errores.confirmacion ? ' tiene-error' : ''}`}>
                <IconoCandado />
                <input
                  id="confirmar-contrasena"
                  name="confirmarContrasena"
                  type={mostrarConfirmacion ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Ingresa tu contraseña"
                  value={confirmacion}
                  
                  aria-invalid={Boolean(errores.confirmacion)}
                  aria-describedby={errores.confirmacion ? 'confirmar-contrasena-error' : undefined}
                  onChange={(event) => {
                    const valor = event.target.value
                    establecerConfirmacion(valor)
                    establecerErrores((actuales) => ({ ...actuales, confirmacion: valor ? valor !== contrasena ? 'Las contraseñas no coinciden.' : '' : actuales.confirmacion ? 'Confirma tu contraseña.' : '' }))
                  }}
                />
                <button
                  className="alternar-visibilidad"
                  type="button"
                  aria-label={mostrarConfirmacion ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                  aria-pressed={mostrarConfirmacion}
                  onClick={() => establecerVisibilidadConfirmacion((actual) => !actual)}
                >
                  <IconoVisibilidad visible={mostrarConfirmacion} />
                </button>
              </div>
              {errores.confirmacion && <p className="error-campo" id="confirmar-contrasena-error">{errores.confirmacion}</p>}
            </div>

            <p className="ayuda-contrasena" id="ayuda-contrasena">Mínimo 8 caracteres. Incluye una mayúscula, un número y un carácter especial.</p>
            <button className="boton-iniciar" type="submit">
              Guardar contraseña <span aria-hidden="true">→</span>
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
