package mx.vitacare.api.service;

import mx.vitacare.api.dto.ConsultaRequestDTO;
import mx.vitacare.api.dto.ConsultaResponseDTO;
import mx.vitacare.api.dto.ExpedienteRequestDTO;
import mx.vitacare.api.dto.ExpedienteResponseDTO;
import mx.vitacare.api.exception.RecursoNoEncontradoException;
import mx.vitacare.api.model.Consulta;
import mx.vitacare.api.model.Expediente;
import mx.vitacare.api.model.Medico;
import mx.vitacare.api.model.Paciente;
import mx.vitacare.api.repository.ConsultaRepository;
import mx.vitacare.api.repository.ExpedienteRepository;
import mx.vitacare.api.repository.MedicoRepository;
import mx.vitacare.api.repository.PacienteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class ExpedienteService {

    private final ExpedienteRepository expedienteRepository;
    private final ConsultaRepository consultaRepository;
    private final PacienteRepository pacienteRepository;
    private final MedicoRepository medicoRepository;

    public ExpedienteService(ExpedienteRepository expedienteRepository,
                             ConsultaRepository consultaRepository,
                             PacienteRepository pacienteRepository,
                             MedicoRepository medicoRepository) {
        this.expedienteRepository = expedienteRepository;
        this.consultaRepository = consultaRepository;
        this.pacienteRepository = pacienteRepository;
        this.medicoRepository = medicoRepository;
    }

    @Transactional
    public ExpedienteResponseDTO obtenerOCrearPorPacienteId(Long pacienteId) {
        Expediente expediente = expedienteRepository.findByPacienteId(pacienteId)
                .orElseGet(() -> {
                    Paciente paciente = pacienteRepository.findById(pacienteId)
                            .orElseThrow(() -> new RecursoNoEncontradoException("Paciente no encontrado con ID: " + pacienteId));
                    Expediente nuevo = new Expediente();
                    nuevo.setPaciente(paciente);
                    nuevo.setAntecedentesPersonales("Sin antecedentes registrados.");
                    nuevo.setAlergias("No conocidas");
                    nuevo.setPadecimientosCronicos("Sin padecimientos crónicos registrados");
                    nuevo.setMedicamentosUsoContinuo("Sin medicamentos de uso continuo");
                    nuevo.setCirugiasPrevias("Sin antecedentes quirúrgicos registrados");
                    nuevo.setAntecedentesFamiliares("Sin antecedentes familiares relevantes");
                    return expedienteRepository.save(nuevo);
                });

        return convertirADto(expediente);
    }

    @Transactional
    public ExpedienteResponseDTO actualizarResumen(Long pacienteId, ExpedienteRequestDTO dto) {
        Expediente expediente = expedienteRepository.findByPacienteId(pacienteId)
                .orElseGet(() -> {
                    Paciente paciente = pacienteRepository.findById(pacienteId)
                            .orElseThrow(() -> new RecursoNoEncontradoException("Paciente no encontrado con ID: " + pacienteId));
                    Expediente nuevo = new Expediente();
                    nuevo.setPaciente(paciente);
                    return expedienteRepository.save(nuevo);
                });

        if (dto.getAntecedentes() != null) expediente.setAntecedentesPersonales(dto.getAntecedentes());
        if (dto.getAlergias() != null) expediente.setAlergias(dto.getAlergias());
        if (dto.getPadecimientos() != null) expediente.setPadecimientosCronicos(dto.getPadecimientos());
        if (dto.getMedicamentos() != null) expediente.setMedicamentosUsoContinuo(dto.getMedicamentos());
        if (dto.getCirugias() != null) expediente.setCirugiasPrevias(dto.getCirugias());
        if (dto.getAntecedentesFamiliares() != null) expediente.setAntecedentesFamiliares(dto.getAntecedentesFamiliares());

        Expediente guardado = expedienteRepository.save(expediente);
        return convertirADto(guardado);
    }

    @Transactional
    public ExpedienteResponseDTO agregarConsulta(Long pacienteId, ConsultaRequestDTO dto) {
        Expediente expediente = expedienteRepository.findByPacienteId(pacienteId)
                .orElseGet(() -> {
                    Paciente paciente = pacienteRepository.findById(pacienteId)
                            .orElseThrow(() -> new RecursoNoEncontradoException("Paciente no encontrado con ID: " + pacienteId));
                    Expediente nuevo = new Expediente();
                    nuevo.setPaciente(paciente);
                    return expedienteRepository.save(nuevo);
                });

        Medico medico = medicoRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Médico no encontrado con ID: " + dto.getDoctorId()));

        LocalDate fecha = dto.getFecha() != null ? dto.getFecha() : LocalDate.now();

        Consulta consulta = new Consulta();
        consulta.setExpediente(expediente);
        consulta.setMedico(medico);
        consulta.setFechaConsulta(fecha);
        consulta.setMotivoConsulta(dto.getMotivo());
        consulta.setDiagnostico(dto.getDiagnostico());
        consulta.setTratamiento(dto.getTratamiento());
        consulta.setProximaRevision(dto.getProximaRevision());
        consulta.setObservaciones(dto.getObservaciones());
        consulta.setPresionArterial(dto.getPresion());
        consulta.setPulso(dto.getPulso());
        consulta.setTemperatura(dto.getTemperatura());
        consulta.setPeso(dto.getPeso());
        consulta.setEstatura(dto.getEstatura());

        consultaRepository.save(consulta);

        // Actualizamos última visita del paciente
        Paciente p = expediente.getPaciente();
        p.setUltimaVisita(fecha);
        pacienteRepository.save(p);

        return convertirADto(expediente);
    }

    @Transactional
    public ExpedienteResponseDTO obtenerMiExpediente(String email) {
        Paciente paciente = pacienteRepository.findByUsuarioEmail(email)
                .orElseThrow(() -> new RecursoNoEncontradoException("No se encontró registro de paciente para el usuario: " + email));
        return obtenerOCrearPorPacienteId(paciente.getId());
    }

    @Transactional(readOnly = true)
    public List<ExpedienteResponseDTO> listarTodos() {
        return expedienteRepository.findAll().stream().map(this::convertirADto).toList();
    }

    private ExpedienteResponseDTO convertirADto(Expediente exp) {
        List<ConsultaResponseDTO> entradas = consultaRepository.findByExpedienteIdOrderByFechaConsultaDesc(exp.getId())
                .stream()
                .map(this::convertirConsultaADto)
                .toList();

        return new ExpedienteResponseDTO(
                exp.getId(),
                exp.getPaciente().getId(),
                exp.getPaciente().getUsuario().getNombreCompleto(),
                exp.getAntecedentesPersonales() != null ? exp.getAntecedentesPersonales() : "Sin antecedentes registrados.",
                exp.getAlergias() != null ? exp.getAlergias() : "No conocidas",
                exp.getPadecimientosCronicos() != null ? exp.getPadecimientosCronicos() : "Sin padecimientos crónicos registrados",
                exp.getMedicamentosUsoContinuo() != null ? exp.getMedicamentosUsoContinuo() : "Sin medicamentos de uso continuo",
                exp.getCirugiasPrevias() != null ? exp.getCirugiasPrevias() : "Sin antecedentes quirúrgicos registrados",
                exp.getAntecedentesFamiliares() != null ? exp.getAntecedentesFamiliares() : "Sin antecedentes familiares relevantes",
                exp.getPaciente().getUltimaVisita(),
                entradas
        );
    }

    private ConsultaResponseDTO convertirConsultaADto(Consulta c) {
        return new ConsultaResponseDTO(
                c.getId(),
                c.getExpediente().getId(),
                c.getMedico().getId(),
                c.getMedico().getUsuario().getNombreCompleto(),
                c.getFechaConsulta(),
                c.getMotivoConsulta(),
                c.getDiagnostico(),
                c.getTratamiento(),
                "Sin receta nueva",
                "Sin estudios adicionales",
                c.getProximaRevision(),
                c.getObservaciones(),
                c.getPresionArterial(),
                c.getPulso(),
                c.getTemperatura(),
                c.getPeso(),
                c.getEstatura()
        );
    }
}
