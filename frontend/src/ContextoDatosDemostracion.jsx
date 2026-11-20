import { createContext, useContext, useMemo, useState } from 'react'
import { PACIENTES_DEMOSTRACION } from './data/pacientesDemostracion.js'
import { USUARIOS_DEMOSTRACION } from './data/usuariosDemostracion.js'
import { obtenerFechaConDias, obtenerFechaLocal } from './utilidades/fechas.js'

const fechaHoy = obtenerFechaLocal()

const medicosIniciales = [
  { id: 'M-001', name: 'Dra. Elena Cruz (ejemplo)', specialty: 'Medicina general', email: 'elena.demo@vitacare.invalid', phone: '555 020 0101', license: 'PROF-DEMO-001', availability: 'Lun a Vie · 09:00–14:00', status: 'Activo' },
  { id: 'M-002', name: 'Dr. Andrés Vega (ejemplo)', specialty: 'Cardiología', email: 'andres.demo@vitacare.invalid', phone: '555 020 0102', license: 'PROF-DEMO-002', availability: 'Mar y Jue · 12:00–18:00', status: 'Activo' },
  { id: 'M-003', name: 'Dra. Paula León (ejemplo)', specialty: 'Pediatría', email: 'paula.demo@vitacare.invalid', phone: '555 020 0103', license: 'PROF-DEMO-003', availability: 'Lun, Mié y Vie · 10:00–16:00', status: 'Activo' },
]

const usuariosIniciales = [
  { id: 'U-001', name: USUARIOS_DEMOSTRACION.admin.name, email: USUARIOS_DEMOSTRACION.admin.email, role: 'ADMIN', status: 'Activo' },
  { id: 'U-002', name: USUARIOS_DEMOSTRACION.doctor.name, email: USUARIOS_DEMOSTRACION.doctor.email, role: 'DOCTOR', status: 'Activo' },
  { id: 'U-003', name: USUARIOS_DEMOSTRACION.patient.name, email: USUARIOS_DEMOSTRACION.patient.email, role: 'PATIENT', status: 'Activo' },
]

const citasIniciales = [
  { id: 'C-001', patientId: 'P-001', doctorId: 'M-001', date: fechaHoy, time: '10:30', reason: 'Revisión general', status: 'Confirmada' },
  { id: 'C-002', patientId: 'P-002', doctorId: 'M-002', date: fechaHoy, time: '11:00', reason: 'Seguimiento', status: 'Pendiente' },
  { id: 'C-003', patientId: 'P-003', doctorId: 'M-003', date: fechaHoy, time: '12:15', reason: 'Consulta de valoración', status: 'Confirmada' },
  { id: 'C-004', patientId: 'P-004', doctorId: 'M-001', date: obtenerFechaConDias(1), time: '09:30', reason: 'Consulta general', status: 'Pendiente' },
  { id: 'C-005', patientId: 'P-005', doctorId: 'M-002', date: obtenerFechaConDias(2), time: '13:00', reason: 'Control preventivo', status: 'Confirmada' },
]

const expedientesIniciales = PACIENTES_DEMOSTRACION.map((paciente, indice) => ({
  patientId: paciente.id,
  antecedentes: indice === 0 ? 'Antecedente de ejemplo: revisión preventiva anual.' : 'Sin antecedentes de demostración registrados.',
  entradas: [
    { id: `${paciente.id}-E1`, fecha: '2026-10-20', diagnostico: indice === 2 ? 'Valoración inicial de ejemplo' : 'Consulta general de ejemplo', tratamiento: 'Seguimiento según indicación profesional', observaciones: 'Registro sintético para demostrar la interfaz.' },
  ],
}))

const contexto = createContext(null)

export function ProveedorDatosDemostracion({ children }) {
  const [pacientes, establecerPacientes] = useState(PACIENTES_DEMOSTRACION.map((paciente) => ({ ...paciente })))
  const [citas, establecerCitas] = useState(citasIniciales)
  const [medicos, establecerMedicos] = useState(medicosIniciales)
  const [usuarios, establecerUsuarios] = useState(usuariosIniciales)
  const [expedientes, establecerExpedientes] = useState(expedientesIniciales)
  const [perfiles, establecerPerfiles] = useState({
    admin: { ...USUARIOS_DEMOSTRACION.admin, phone: '555 030 0101', avatar: '', recordatorios: true, novedades: false },
    doctor: { ...USUARIOS_DEMOSTRACION.doctor, phone: '555 030 0102', avatar: '', recordatorios: true, novedades: false },
    patient: { ...USUARIOS_DEMOSTRACION.patient, phone: '555 030 0103', avatar: '', recordatorios: true, novedades: false },
  })

  const valor = useMemo(() => ({
    pacientes, establecerPacientes, citas, establecerCitas, medicos, establecerMedicos,
    usuarios, establecerUsuarios, expedientes, establecerExpedientes, perfiles, establecerPerfiles,
  }), [pacientes, citas, medicos, usuarios, expedientes, perfiles])

  return <contexto.Provider value={valor}>{children}</contexto.Provider>
}
export function useDatosDemostracion() {
  const valor = useContext(contexto)
  if (!valor) throw new Error('usarDatosDemostracion requiere el proveedor del espacio de demostración.')
  return valor
}
