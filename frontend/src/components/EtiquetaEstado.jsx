import Icono from './Icono.jsx'

const iconosPorEstado = {
  Pendiente: 'clock',
  Confirmada: 'check',
  Completada: 'check',
  Cancelada: 'close',
  Activo: 'check',
  Inactivo: 'close',
  Suspendido: 'pause',
  'Sin citas': 'calendar',
  'Vista propia': 'profile',
}

export default function EtiquetaEstado({ estado, className = '' }) {
  return (
    <span className={`etiqueta-estado etiqueta-estado-icono ${className}`.trim()}>
      <Icono name={iconosPorEstado[estado] ?? 'destellos'} size={12} />
      <span>{estado}</span>
    </span>
  )
}
