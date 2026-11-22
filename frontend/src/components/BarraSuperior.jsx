import { useLocation, useNavigate } from 'react-router-dom'
import { NAVEGACION_POR_ROL, TITULOS_DE_PAGINA } from '../config/navegacion.js'
import Icono from './Icono.jsx'

function obtenerTituloPagina(pathname = '', rutaBase = '', role = '') {
  const longitudBase = rutaBase ? rutaBase.length : 0;
  
  const rutaRelativa = pathname.slice(longitudBase).replace(/^\/+|\/+$/g, '')
  const segment = rutaRelativa.split('/').at(-1)
  const navegacion = NAVEGACION_POR_ROL?.[role] ?? [];
  const tituloRol = navegacion.find((item) => item.path === segment)?.label

  return tituloRol ?? TITULOS_DE_PAGINA?.[segment] ?? 'Panel principal'
}

function obtenerIniciales(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toLocaleUpperCase())
    .join('') || 'VC'
}

export default function BarraSuperior({ user, rutaBase, alPulsarMenu }) {
  const location = useLocation()
  const navigate = useNavigate()
  const puedeBuscarPacientes = (NAVEGACION_POR_ROL[user?.role] ?? []).some((item) => item.path === 'pacientes')

  function gestionarBusqueda(event) {
    event.preventDefault()
    const query = new FormData(event.currentTarget).get('search')?.toString().trim()
    if (!query) return
    navigate(`${rutaBase}/pacientes?search=${encodeURIComponent(query)}`)
    event.currentTarget.reset()
  }

  return (
    <header className="app-topbar">
      <div className="encabezado-barra-superior">
        <button className="boton-menu-movil" type="button" aria-label="Abrir menú" onClick={alPulsarMenu}>
          <Icono name="menu" size={20} />
        </button>
        <div className="migas-pan">
          <span>VITACARE</span>
          <span aria-hidden="true">/</span>
          <strong>{obtenerTituloPagina(location.pathname, rutaBase, user?.role)}</strong>
        </div>
      </div>

      <div className="acciones-barra-superior">
        {puedeBuscarPacientes && (
          <form className="busqueda-global" role="search" onSubmit={gestionarBusqueda}>
            <Icono name="search" size={16} />
            <input name="search" type="search" aria-label="Buscar pacientes" placeholder="Buscar pacientes…" />
            <kbd>↵</kbd>
          </form>
        )}
        <div className="usuario-barra-superior" title={user?.email}>
          <span className="avatar-usuario" aria-hidden="true">{obtenerIniciales(user?.name)}</span>
          <span className="nombre-usuario">{user?.name}</span>
          <span className="rol-usuario">{user?.roleLabel}</span>
        </div>
      </div>
    </header>
  )
}
