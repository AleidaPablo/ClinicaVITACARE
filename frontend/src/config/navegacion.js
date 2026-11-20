export const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  PATIENT: 'PATIENT',
})

export const NOMBRES_DE_ROLES = Object.freeze({
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.DOCTOR]: 'Médico',
  [ROLES.PATIENT]: 'Paciente',
})

const perfilComun = { label: 'Mi perfil', path: 'perfil', icon: 'profile' }

export const NAVEGACION_POR_ROL = Object.freeze({
  [ROLES.ADMIN]: [
    { label: 'Panel principal', path: 'dashboard', icon: 'dashboard' },
    { label: 'Pacientes', path: 'pacientes', icon: 'patients' },
    { label: 'Citas médicas', path: 'citas', icon: 'appointments' },
    { label: 'Expedientes clínicos', path: 'expedientes', icon: 'records' },
    { label: 'Médicos', path: 'medicos', icon: 'doctors' },
    { label: 'Usuarios', path: 'usuarios', icon: 'users' },
    perfilComun,
  ],
  [ROLES.DOCTOR]: [
    { label: 'Panel principal', path: 'dashboard', icon: 'dashboard' },
    { label: 'Mis citas', path: 'citas', icon: 'appointments' },
    { label: 'Pacientes autorizados', path: 'pacientes', icon: 'patients' },
    { label: 'Expedientes clínicos', path: 'expedientes', icon: 'records' },
    perfilComun,
  ],
  [ROLES.PATIENT]: [
    { label: 'Panel principal', path: 'dashboard', icon: 'dashboard' },
    { label: 'Mis citas', path: 'mis-citas', icon: 'appointments' },
    { label: 'Mi expediente', path: 'mi-expediente', icon: 'records' },
    perfilComun,
  ],
})

export const TITULOS_DE_PAGINA = Object.freeze(
  Object.fromEntries(
    Object.values(NAVEGACION_POR_ROL)
      .flat()
      .map(({ path, label }) => [path, label]),
  ),
)
