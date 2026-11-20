import { Link, useLocation } from 'react-router-dom'
import fotoInicio from '../assets/foto-consulta.png'

function MarcaCorreo() {
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

export default function RevisaCorreo() {
  const { state } = useLocation()
  const correo = state?.correo || 'tu correo electrónico'

  return (
    <main className="pantalla-inicio">
      <aside
        className="visual-inicio"
        style={{ '--foto-inicio': `url("${fotoInicio}")` }}
        aria-label="Consulta médica"
      >
        <div className="contenido-visual-inicio">
          <MarcaCorreo />
          <div className="separador-visual" />
        </div>
      </aside>

      <section className="panel-inicio" aria-labelledby="revisa-correo-title">
        <div className="tarjeta-inicio tarjeta-recuperacion">
          <div className="marca-movil"><MarcaCorreo /></div>
          <header className="encabezado-inicio">
            <h1 id="revisa-correo-title">Revisa tu correo</h1>
            <p>Si <strong>{correo}</strong> está asociado a una cuenta, recibirás un enlace para restablecer tu contraseña.</p>
          </header>

          <div className="contenido-revisa-correo">
            <p>El enlace caduca en 30 minutos. Revisa también tu carpeta de correo no deseado.</p>
            <Link className="boton-iniciar enlace-boton-iniciar" to="/crear-nueva-contrasena">
              Modificar contraseña <span aria-hidden="true">→</span>
            </Link>
            <p className="texto-reenvio-correo">
              ¿No recibiste el correo? <Link to="/recuperar-contrasena" state={{ correo }}>Reenviar enlace</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
