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
import mx.vitacare.api.repository.CitaRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import mx.vitacare.api.specification.ExpedienteSpecs;

import java.time.LocalDate;
import java.util.List;

@Service
public class ExpedienteService {

    private final ExpedienteRepository expedienteRepository;
    private final ConsultaRepository consultaRepository;
    private final PacienteRepository pacienteRepository;
    private final MedicoRepository medicoRepository;
    private final CitaRepository citaRepository;

    public ExpedienteService(ExpedienteRepository expedienteRepository,
                             ConsultaRepository consultaRepository,
                             PacienteRepository pacienteRepository,
                             MedicoRepository medicoRepository,
                             CitaRepository citaRepository) {
        this.expedienteRepository = expedienteRepository;
        this.consultaRepository = consultaRepository;
        this.pacienteRepository = pacienteRepository;
        this.medicoRepository = medicoRepository;
        this.citaRepository = citaRepository;
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
    public ExpedienteResponseDTO obtenerPorPacienteId(Long pacienteId, String correoUsuario, String rol) {
        validarAccesoPaciente(pacienteId, correoUsuario, rol);
        return obtenerOCrearPorPacienteId(pacienteId);
    }

    @Transactional
    public ExpedienteResponseDTO actualizarResumen(
            Long pacienteId,
            ExpedienteRequestDTO dto,
            String correoUsuario,
            String rol) {
        validarAccesoPaciente(pacienteId, correoUsuario, rol);
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
    public ExpedienteResponseDTO agregarConsulta(
            Long pacienteId,
            ConsultaRequestDTO dto,
            String correoUsuario,
            String rol) {
        validarAccesoPaciente(pacienteId, correoUsuario, rol);
        Expediente expediente = expedienteRepository.findByPacienteId(pacienteId)
                .orElseGet(() -> {
                    Paciente paciente = pacienteRepository.findById(pacienteId)
                            .orElseThrow(() -> new RecursoNoEncontradoException("Paciente no encontrado con ID: " + pacienteId));
                    Expediente nuevo = new Expediente();
                    nuevo.setPaciente(paciente);
                    return expedienteRepository.save(nuevo);
                });

        Medico medico;
        if ("DOCTOR".equals(rol)) {
            medico = medicoRepository.findByUsuarioEmail(correoUsuario)
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "No se encontró el perfil médico asociado."));
        } else {
            medico = medicoRepository.findById(dto.getDoctorId())
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "Médico no encontrado con ID: " + dto.getDoctorId()));
        }

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
    public List<ExpedienteResponseDTO> listarTodos(String correoUsuario, String rol) {
        if ("ADMIN".equals(rol)) {
            return expedienteRepository.findAll().stream().map(this::convertirADto).toList();
        }
        if ("DOCTOR".equals(rol)) {
            Long medicoId = medicoRepository.findByUsuarioEmail(correoUsuario)
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "No se encontró el perfil médico asociado."))
                    .getId();
            List<Long> pacienteIds = citaRepository.findByMedicoId(medicoId).stream()
                    .map(cita -> cita.getPaciente().getId())
                    .distinct()
                    .toList();
            return expedienteRepository.findAllByPacienteIdIn(pacienteIds).stream()
                    .map(this::convertirADto)
                    .toList();
        }
        throw new AccessDeniedException("El rol no tiene acceso a los expedientes.");
    }



@Transactional(readOnly = true)
public Page<ExpedienteResponseDTO> listarPaginados(
        String nombre,
        String correo,
        Pageable pageable,
        String correoUsuario,
        String rol) {

    Specification<Expediente> spec = ExpedienteSpecs.todas();

    if (nombre != null && !nombre.isBlank()) {
        spec = spec.and(ExpedienteSpecs.porNombrePaciente(nombre.trim()));
    }

    if (correo != null && !correo.isBlank()) {
        spec = spec.and(ExpedienteSpecs.porCorreoPaciente(correo.trim()));
    }

    if ("ADMIN".equals(rol)) {
        return expedienteRepository.findAll(spec, pageable)
                .map(this::convertirADto);
    }

    if ("DOCTOR".equals(rol)) {
        Long medicoId = medicoRepository.findByUsuarioEmail(correoUsuario)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No se encontró el perfil médico asociado."))
                .getId();

        List<Long> pacienteIds = citaRepository.findByMedicoId(medicoId).stream()
                .map(cita -> cita.getPaciente().getId())
                .distinct()
                .toList();

        spec = spec.and((root, query, cb) ->
                root.get("paciente").get("id").in(pacienteIds));

        return expedienteRepository.findAll(spec, pageable)
                .map(this::convertirADto);
    }

    throw new AccessDeniedException(
            "El rol no tiene acceso a los expedientes.");
}



    private void validarAccesoPaciente(Long pacienteId, String correoUsuario, String rol) {
        if ("ADMIN".equals(rol)) {
            return;
        }
        if ("PATIENT".equals(rol)) {
            Long pacientePropioId = pacienteRepository.findByUsuarioEmail(correoUsuario)
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "No se encontró el perfil de paciente asociado."))
                    .getId();
            if (!pacientePropioId.equals(pacienteId)) {
                throw new AccessDeniedException("Solo puedes consultar tu propio expediente.");
            }
            return;
        }
        if ("DOCTOR".equals(rol)) {
            Long medicoId = medicoRepository.findByUsuarioEmail(correoUsuario)
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "No se encontró el perfil médico asociado."))
                    .getId();
            if (!citaRepository.existsByPacienteIdAndMedicoId(pacienteId, medicoId)) {
                throw new AccessDeniedException(
                        "No tienes una cita asignada con este paciente.");
            }
            return;
        }
        throw new AccessDeniedException("El rol no tiene acceso al expediente.");
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
