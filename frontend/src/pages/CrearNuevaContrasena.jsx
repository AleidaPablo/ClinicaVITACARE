import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import fotoInicio from '../assets/foto-consulta.png'

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

function validarContrasena(contrasena, confirmacion) {
  if (contrasena.length < 12 || !/[A-Z]/.test(contrasena) || !/\d/.test(contrasena) || !/[^A-Za-z0-9]/.test(contrasena)) {
    return 'Usa al menos 12 caracteres, una mayúscula, un número y un símbolo.'
  }
  if (contrasena !== confirmacion) return 'Las contraseñas no coinciden.'
  return ''
}

export default function CrearNuevaContrasena() {
  const navigate = useNavigate()
  const [contrasena, establecerContrasena] = useState('')
  const [confirmacion, establecerConfirmacion] = useState('')
  const [mostrarContrasena, establecerVisibilidadContrasena] = useState(false)
  const [mostrarConfirmacion, establecerVisibilidadConfirmacion] = useState(false)
  const [error, establecerError] = useState('')

  function gestionarEnvio(event) {
    event.preventDefault()
    const errorValidacion = validarContrasena(contrasena, confirmacion)
    establecerError(errorValidacion)
    if (!errorValidacion) navigate('/demo')
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

          <form className="formulario-inicio formulario-recuperacion" onSubmit={gestionarEnvio}>
            <div className="campo-formulario">
              <label htmlFor="nueva-contrasena">Nueva contraseña</label>
              <div className="contenedor-entrada">
                <IconoCandado />
                <input
                  id="nueva-contrasena"
                  name="nuevaContrasena"
                  type={mostrarContrasena ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Ingresa tu contraseña"
                  value={contrasena}
                  onChange={(event) => establecerContrasena(event.target.value)}
                  required
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
            </div>

            <div className="campo-formulario">
              <label htmlFor="confirmar-contrasena">Confirmar contraseña</label>
              <div className="contenedor-entrada">
                <IconoCandado />
                <input
                  id="confirmar-contrasena"
                  name="confirmarContrasena"
                  type={mostrarConfirmacion ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Ingresa tu contraseña"
                  value={confirmacion}
                  onChange={(event) => establecerConfirmacion(event.target.value)}
                  required
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
            </div>

            <p className="ayuda-contrasena">Mínimo 12 caracteres. Incluye mayúsculas, números y símbolos.</p>
            {error && <p className="error-campo" role="alert">{error}</p>}
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
