import { useContext } from 'react'
import { contextoAutenticacion } from './ContextoAutenticacionCompartido.js'

export function useAutenticacion() {
  const context = useContext(contextoAutenticacion)
  if (!context) throw new Error('useAutenticacion debe utilizarse dentro de ProveedorAutenticacion.')
  return context
}
