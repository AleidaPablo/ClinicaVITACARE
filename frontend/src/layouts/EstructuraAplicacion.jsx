import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import BarraLateral from '../components/BarraLateral.jsx'
import BarraSuperior from '../components/BarraSuperior.jsx'

export default function EstructuraAplicacion({ user, rutaBase, alCerrarSesion, children }) {
  const [menuLateralAbierto, setBarraLateralOpen] = useState(false)
  const contenidoPagina = children ?? <Outlet context={{ user, rutaBase }} />

  return (
    <div className="estructura-app">
      <BarraLateral
        user={user}
        rutaBase={rutaBase}
        alCerrarSesion={alCerrarSesion}
        estaAbierto={menuLateralAbierto}
        alCerrar={() => setBarraLateralOpen(false)}
      />
      <div className="contenido-principal-app">
        <BarraSuperior user={user} rutaBase={rutaBase} alPulsarMenu={() => setBarraLateralOpen(true)} />
        <main className="contenido-app">{contenidoPagina}</main>
      </div>
    </div>
  )
}
