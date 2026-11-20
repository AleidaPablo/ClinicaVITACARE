import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import BarraLateral from '../components/BarraLateral.jsx'
import BarraSuperior from '../components/BarraSuperior.jsx'

export default function EstructuraAplicacion({ user, rutaBase, alCerrarSesion, modoDemostracion = false, children }) {
  const [menuLateralAbierto, setBarraLateralOpen] = useState(false)
  const contenidoPagina = children ?? <Outlet context={{ user, rutaBase, modoDemostracion }} />

  return (
    <div className="estructura-app">
      <BarraLateral
        user={user}
        rutaBase={rutaBase}
        alCerrarSesion={alCerrarSesion}
        estaAbierto={menuLateralAbierto}
        alCerrar={() => setBarraLateralOpen(false)}
        modoDemostracion={modoDemostracion}
      />
      <div className="contenido-principal-app">
        <BarraSuperior user={user} rutaBase={rutaBase} alPulsarMenu={() => setBarraLateralOpen(true)} />
        {modoDemostracion && (
          <div className="aviso-demostracion" role="status">
            <strong>Modo demostración</strong>
            <span>Datos ilustrativos; los cambios no se guardan en el servidor.</span>
          </div>
        )}
        <main className="contenido-app">{contenidoPagina}</main>
      </div>
    </div>
  )
}
