import { useMemo, useState } from 'react'
import { PACIENTES_DEMOSTRACION } from './data/pacientesDemostracion.js'
import { USUARIOS_DEMOSTRACION } from './data/usuariosDemostracion.js'
import { obtenerFechaConDias, obtenerFechaLocal } from './utilidades/fechas.js'
import { contextoDatosDemostracion } from './context/ContextoDatosDemostracionCompartido.js'

const fechaHoy = obtenerFechaLocal()

const medicosIniciales = [
  { id: 'M-001', name: 'Dra. Elena Cruz', specialty: 'Medicina general', email: 'elena.demo@vitacare.invalid', phone: '555 020 0101', license: 'PROF-DEMO-001', experience: 12, languages: 'Español', consultationRoom: 'Consultorio 1', availability: 'Lun a Vie · 09:00–14:00', status: 'Activo' },
  { id: 'M-002', name: 'Dr. Andrés Vega', specialty: 'Cardiología', email: 'andres.demo@vitacare.invalid', phone: '555 020 0102', license: 'PROF-DEMO-002', experience: 9, languages: 'Español, Inglés', consultationRoom: 'Consultorio 3', availability: 'Mar y Jue · 12:00–18:00', status: 'Activo' },
  { id: 'M-003', name: 'Dra. Paula León', specialty: 'Pediatría', email: 'paula.demo@vitacare.invalid', phone: '555 020 0103', license: 'PROF-DEMO-003', experience: 7, languages: 'Español', consultationRoom: 'Consultorio 2', availability: 'Lun, Mié y Vie · 10:00–16:00', status: 'Activo' },
]

const usuariosIniciales = [
  { id: 'U-001', name: USUARIOS_DEMOSTRACION.admin.name, email: USUARIOS_DEMOSTRACION.admin.email, phone: '555 030 0101', department: 'Administración', lastAccess: 'Hoy · 08:42', role: 'ADMIN', status: 'Activo' },
  { id: 'U-002', name: USUARIOS_DEMOSTRACION.doctor.name, email: USUARIOS_DEMOSTRACION.doctor.email, phone: '555 030 0102', department: 'Medicina general', lastAccess: 'Hoy · 08:10', role: 'DOCTOR', status: 'Activo' },
  { id: 'U-003', name: USUARIOS_DEMOSTRACION.patient.name, email: USUARIOS_DEMOSTRACION.patient.email, phone: '555 030 0103', department: 'Atención a pacientes', lastAccess: 'Ayer · 18:25', role: 'PATIENT', status: 'Activo' },
]

const citasIniciales = [
  { id: 'C-001', patientId: 'P-001', doctorId: 'M-001', date: fechaHoy, time: '10:30', type: 'Consulta general', reason: 'Revisión anual', duration: 30, modality: 'Presencial', location: 'Consultorio 1', status: 'Confirmada' },
  { id: 'C-002', patientId: 'P-002', doctorId: 'M-002', date: fechaHoy, time: '11:00', type: 'Seguimiento', reason: 'Control de presión arterial', duration: 45, modality: 'Presencial', location: 'Consultorio 3', status: 'Pendiente' },
  { id: 'C-003', patientId: 'P-003', doctorId: 'M-003', date: fechaHoy, time: '12:15', type: 'Primera consulta', reason: 'Valoración médica', duration: 30, modality: 'Presencial', location: 'Consultorio 2', status: 'Confirmada' },
  { id: 'C-004', patientId: 'P-004', doctorId: 'M-001', date: obtenerFechaConDias(1), time: '09:30', type: 'Consulta general', reason: 'Consulta de seguimiento', duration: 30, modality: 'Teleconsulta', location: 'En línea', status: 'Pendiente' },
  { id: 'C-005', patientId: 'P-005', doctorId: 'M-002', date: obtenerFechaConDias(2), time: '13:00', type: 'Control preventivo', reason: 'Revisión de rutina', duration: 45, modality: 'Presencial', location: 'Consultorio 3', status: 'Confirmada' },
]

const expedientesIniciales = PACIENTES_DEMOSTRACION.map((paciente, indice) => ({
  patientId: paciente.id,
  antecedentes: indice === 0 ? 'Revisión preventiva anual.' : 'Sin antecedentes registrados.',
  alergias: indice === 1 ? 'Penicilina' : 'No conocidas',
  padecimientos: indice === 1 ? 'Hipertensión en seguimiento' : 'Sin padecimientos crónicos registrados',
  medicamentos: indice === 1 ? 'Losartán · según indicación médica' : 'Sin medicamentos de uso continuo',
  cirugias: 'Sin antecedentes quirúrgicos registrados',
  antecedentesFamiliares: indice === 1 ? 'Hipertensión arterial en familiares de primer grado' : 'Sin antecedentes familiares relevantes',
  entradas: [
    { id: `${paciente.id}-E1`, fecha: '2026-11-12', doctorId: indice === 2 ? 'M-003' : indice === 1 ? 'M-002' : 'M-001', motivo: 'Revisión de rutina', diagnostico: indice === 2 ? 'Valoración médica inicial' : 'Consulta general', tratamiento: 'Seguimiento según indicación profesional', medicamentos: indice === 1 ? 'Losartán · según indicación médica' : 'Sin receta nueva', estudios: 'Sin estudios adicionales', proximaRevision: '2027-05-12', observaciones: 'Revisar evolución en la siguiente consulta.', presion: indice === 1 ? '128/82' : '118/76', pulso: '72', temperatura: '36.6', peso: String(68 + indice), estatura: '1.64' },
    { id: `${paciente.id}-E2`, fecha: '2026-08-12', doctorId: indice === 2 ? 'M-003' : indice === 1 ? 'M-002' : 'M-001', motivo: 'Consulta de seguimiento', diagnostico: 'Control preventivo', tratamiento: 'Continuar seguimiento clínico', medicamentos: 'Sin receta nueva', estudios: indice === 1 ? 'Laboratorios de control revisados' : 'Sin estudios adicionales', proximaRevision: '2026-11-12', observaciones: 'Paciente estable. Se recomienda continuar revisiones periódicas.', presion: '116/74', pulso: '70', temperatura: '36.5', peso: String(69 + indice), estatura: '1.64' },
  ],
}))

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

  return <contextoDatosDemostracion.Provider value={valor}>{children}</contextoDatosDemostracion.Provider>
}
