export function obtenerFechaLocal(fecha = new Date()) {
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

export function obtenerFechaConDias(dias) {
  const fecha = new Date()
  fecha.setDate(fecha.getDate() + dias)
  return obtenerFechaLocal(fecha)
}
