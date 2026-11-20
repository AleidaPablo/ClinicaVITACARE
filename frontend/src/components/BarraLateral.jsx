import { NavLink } from 'react-router-dom'
import { NAVEGACION_POR_ROL, NOMBRES_DE_ROLES } from '../config/navegacion.js'
import Icono from './Icono.jsx'

function BarraLateralBrand() {
  return (
    <div className="brand marca-barra-lateral" aria-label="VITACARE">
      <span className="marca-icono" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" fill="currentColor" />
        </svg>
      </span>
      <span className="nombre-marca">VITACARE</span>
    </div>
  )
}

export default function BarraLateral({ user, rutaBase, alCerrarSesion, estaAbierto, alCerrar, modoDemostracion }) {
  const items = NAVEGACION_POR_ROL[user?.role] ?? []

  return (
    <>
      {estaAbierto && <button className="fondo-lateral" type="button" aria-label="Cerrar menú" onClick={alCerrar} />}
      <aside className={`barra-lateral-app${estaAbierto ? ' abierto' : ''}`} aria-label="Navegación principal">
        <BarraLateralBrand />

        <div className="etiqueta-seccion-lateral">ESPACIO DE TRABAJO</div>
        <nav className="navegacion-lateral">
          {items.map((item) => (
            <NavLink
              className={({ isActive }) => `enlace-lateral${isActive ? ' activo' : ''}`}
              end={item.path === 'dashboard'}
              key={item.path}
              onClick={alCerrar}
              to={`${rutaBase}/${item.path}`}
            >
              <Icono name={item.icon} size={17} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="pie-barra-lateral">
          <div className="rol-barra-lateral">
            <span className="punto-rol-lateral" />
            {NOMBRES_DE_ROLES[user?.role] ?? 'Usuario'}
          </div>
          <button className="enlace-lateral salir-lateral" type="button" onClick={alCerrarSesion}>
            <Icono name="logout" size={17} />
            <span>{modoDemostracion ? 'Salir de demostración' : 'Cerrar sesión'}</span>
          </button>
        </div>
      </aside>
    </>
  )
}
