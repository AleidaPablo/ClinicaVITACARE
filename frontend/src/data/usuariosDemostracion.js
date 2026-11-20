import { NOMBRES_DE_ROLES, ROLES } from '../config/navegacion.js'

export const USUARIOS_DEMOSTRACION = Object.freeze({
  admin: {
    id: 'demo-admin',
    name: 'Administración',
    email: 'admin.demo@vitacare.invalid',
    role: ROLES.ADMIN,
    roleLabel: NOMBRES_DE_ROLES[ROLES.ADMIN],
  },
  doctor: {
    id: 'demo-doctor',
    name: 'Dra. Elena Cruz',
    email: 'doctor.demo@vitacare.invalid',
    role: ROLES.DOCTOR,
    roleLabel: NOMBRES_DE_ROLES[ROLES.DOCTOR],
    doctorId: 'M-001',
  },
  patient: {
    id: 'demo-patient',
    name: 'Lucía Hernández',
    email: 'patient.demo@vitacare.invalid',
    role: ROLES.PATIENT,
    roleLabel: NOMBRES_DE_ROLES[ROLES.PATIENT],
    patientId: 'P-001',
  },
})
