import { Link } from 'react-router-dom'
import { USUARIOS_DEMOSTRACION } from '../data/usuariosDemostracion.js'

const roles = [
  { key: 'admin', title: 'Administrador', description: 'Vista general y administración de la clínica.' },
  { key: 'doctor', title: 'Médico', description: 'Agenda, pacientes autorizados y expedientes.' },
  { key: 'patient', title: 'Paciente', description: 'Citas e información propia.' },
]

export default function SelectorRolesDemo() {
  return (
    <main className="pagina-selector-demo">
      <div className="tarjeta-selector-demo">
        <span className="sobretitulo-demo">VITACARE</span>
        <h1>Explora VITACARE</h1>
        <p>Elige un perfil para explorar los espacios de trabajo de VITACARE.</p>
        <div className="lista-roles-demo">
          {roles.map((role) => (
            <Link className="tarjeta-rol-demo" key={role.key} to={`/demo/${role.key}/dashboard`}>
              <span className="avatar-rol-demo" aria-hidden="true">{USUARIOS_DEMOSTRACION[role.key].name.slice(0, 1)}</span>
              <span className="texto-rol-demo">
                <strong>{role.title}</strong>
                <span>{role.description}</span>
              </span>
              <span className="flecha-rol-demo" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
        <Link className="enlace-regreso-demo" to="/login">Volver al inicio de sesión</Link>
      </div>
    </main>
  )
}
