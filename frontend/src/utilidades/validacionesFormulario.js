
export function validarNombre(valor, obligatorio = true) {
  const nombre = String(valor ?? '').trim()

  if (!nombre) {
    return obligatorio ? 'Escribe el nombre completo.' : ''
  }

  if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(nombre)) {
    return 'El nombre solo debe contener letras y espacios.'
  }

  return ''
}

export function validarCorreo(valor) {
  const correo = String(valor ?? '').trim()

  if (!correo) return 'Escribe tu correo electrónico.'

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
    ? ''
    : 'Escribe un correo electrónico válido.'
}

export function validarTelefono(valor, obligatorio = false) {
  const telefono = String(valor ?? '')

  if (!telefono.trim()) {
    return obligatorio ? 'Escribe un teléfono de contacto.' : ''
  }

  if (!/^[0-9]+$/.test(telefono)) {
    return 'El teléfono solo debe contener números.'
  }

  if (telefono.length !== 10) {
    return 'El teléfono debe tener exactamente 10 dígitos.'
  }

  return ''
}

export function validarContrasena(valor) {
  const contrasena = String(valor ?? '')

  if (contrasena.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres.'
  }

  if (!/[A-Z]/.test(contrasena)) {
    return 'Agrega al menos una letra mayúscula.'
  }

  if (!/\d/.test(contrasena)) {
    return 'Agrega al menos un número.'
  }

  if (!/[^A-Za-z0-9]/.test(contrasena)) {
    return 'Agrega al menos un carácter especial.'
  }

  return ''
}

export function normalizarDatosFormulario(formulario) {
  return Object.fromEntries(
    [...new FormData(formulario)].map(([nombre, valor]) => [
      nombre,
      typeof valor === 'string' ? valor.trim() : valor
    ])
  )
}
