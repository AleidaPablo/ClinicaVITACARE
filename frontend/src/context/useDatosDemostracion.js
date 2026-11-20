import { useContext } from 'react'
import { contextoDatosDemostracion } from './ContextoDatosDemostracionCompartido.js'

export function useDatosDemostracion() {
  const valor = useContext(contextoDatosDemostracion)
  if (!valor) throw new Error('usarDatosDemostracion requiere el proveedor del espacio de demostración.')
  return valor
}
