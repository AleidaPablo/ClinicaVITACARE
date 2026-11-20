import { Link } from 'react-router-dom'
import fotoInicio from '../assets/foto-consulta.png'

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
  function evitarEnvio(event) {
    event.preventDefault()
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

          <form className="formulario-inicio formulario-recuperacion" onSubmit={evitarEnvio}>
            <div className="campo-formulario">
              <label htmlFor="correo-recuperacion">Correo electrónico</label>
              <div className="contenedor-entrada">
                <IconoCorreo />
                <input
                  id="correo-recuperacion"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
            </div>

            <button className="boton-iniciar" type="submit">
              Enviar enlace <span aria-hidden="true">→</span>
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
