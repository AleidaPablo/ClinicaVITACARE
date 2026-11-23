package mx.vitacare.api.service;

import mx.vitacare.api.dto.CitaRequestDTO;
import mx.vitacare.api.dto.CitaResponseDTO;
import mx.vitacare.api.exception.ConflictoException;
import mx.vitacare.api.exception.RecursoNoEncontradoException;
import mx.vitacare.api.model.Cita;
import mx.vitacare.api.model.Medico;
import mx.vitacare.api.model.Paciente;
import mx.vitacare.api.notificacion.CitaNotificacionEvento;
import mx.vitacare.api.repository.CitaRepository;
import mx.vitacare.api.repository.CitaSpecs;
import mx.vitacare.api.repository.MedicoRepository;
import mx.vitacare.api.repository.PacienteRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CitaService {

    private final CitaRepository citaRepository;
    private final PacienteRepository pacienteRepository;
    private final MedicoRepository medicoRepository;
    private final ApplicationEventPublisher eventos;

    public CitaService(CitaRepository citaRepository, PacienteRepository pacienteRepository, MedicoRepository medicoRepository,
                       ApplicationEventPublisher eventos) {
        this.citaRepository = citaRepository;
        this.pacienteRepository = pacienteRepository;
        this.medicoRepository = medicoRepository;
        this.eventos = eventos;
    }

    @Transactional(readOnly = true)
    public Page<CitaResponseDTO> listarPaginadas(
            Long pacienteId,
            Long medicoId,
            String estado,
            Pageable pageable,
            String correoUsuario,
            String rol) {
        if ("PATIENT".equals(rol)) {
            pacienteId = pacienteRepository.findByUsuarioEmail(correoUsuario)
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "No se encontró el perfil de paciente asociado."))
                    .getId();
            medicoId = null;
        } else if ("DOCTOR".equals(rol)) {
            medicoId = medicoRepository.findByUsuarioEmail(correoUsuario)
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "No se encontró el perfil médico asociado."))
                    .getId();
            pacienteId = null;
        } else if (!"ADMIN".equals(rol)) {
            throw new AccessDeniedException("El rol no tiene acceso a las citas.");
        }

        Specification<Cita> spec = CitaSpecs.todas();
        if (pacienteId != null) {
            spec = spec.and(CitaSpecs.dePaciente(pacienteId));
        }
        if (medicoId != null) {
            spec = spec.and(CitaSpecs.deMedico(medicoId));
        }
        if (estado != null && !estado.isBlank() && !estado.equalsIgnoreCase("Todos")) {
            spec = spec.and(CitaSpecs.conEstado(estado.toUpperCase()));
        }
        return citaRepository.findAll(spec, pageable).map(this::convertirADto);
    }

    @Transactional
    public CitaResponseDTO cambiarEstado(Long id, String nuevoEstado, String correoUsuario, String rol) {
        Cita cita = citaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cita no encontrada con ID: " + id));
        validarPropiedad(cita, correoUsuario, rol);
        if ("PATIENT".equals(rol) && !"CANCELADA".equalsIgnoreCase(nuevoEstado)) {
            throw new AccessDeniedException("El paciente solo puede cancelar sus propias citas.");
        }
        cita.setEstado(nuevoEstado.toUpperCase());
        Cita actualizada = citaRepository.save(cita);
        eventos.publishEvent(new CitaNotificacionEvento(actualizada.getId(), CitaNotificacionEvento.Tipo.ESTADO_CAMBIADO));
        return convertirADto(actualizada);
    }

    @Transactional
    public CitaResponseDTO actualizar(Long id, CitaRequestDTO dto, String correoUsuario, String rol) {
        Cita cita = citaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cita no encontrada con ID: " + id));
        validarPropiedad(cita, correoUsuario, rol);
        if ("DOCTOR".equals(rol)
                && ((dto.getPacienteId() != null
                        && !dto.getPacienteId().equals(cita.getPaciente().getId()))
                || (dto.getMedicoId() != null
                        && !dto.getMedicoId().equals(cita.getMedico().getId())))) {
            throw new AccessDeniedException(
                    "Un médico no puede reasignar una cita a otro paciente o médico.");
        }

        if (dto.getPacienteId() != null) {
            Paciente paciente = pacienteRepository.findById(dto.getPacienteId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Paciente no encontrado"));
            cita.setPaciente(paciente);
        }
        if (dto.getMedicoId() != null) {
            Medico medico = medicoRepository.findById(dto.getMedicoId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Médico no encontrado"));
            cita.setMedico(medico);
        }
        if (dto.getFechaHora() != null) {
            cita.setFechaHora(dto.getFechaHora());
        }
        if (dto.getTipoConsulta() != null) {
            cita.setTipoConsulta(dto.getTipoConsulta());
        }
        if (dto.getMotivo() != null) {
            cita.setMotivo(dto.getMotivo());
        }
        if (dto.getDuracion() != null) {
            cita.setDuracion(dto.getDuracion());
        }
        if (dto.getModalidad() != null) {
            cita.setModalidad(dto.getModalidad());
        }
        if (dto.getUbicacion() != null) {
            cita.setUbicacion(dto.getUbicacion());
        }

        return convertirADto(citaRepository.save(cita));
    }

    @Transactional
    public CitaResponseDTO crear(CitaRequestDTO dto, String correoUsuario, String rol) {
        Long pacienteId = dto.getPacienteId();
        Long medicoId = dto.getMedicoId();
        if ("PATIENT".equals(rol)) {
            pacienteId = pacienteRepository.findByUsuarioEmail(correoUsuario)
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "No se encontró el perfil de paciente asociado."))
                    .getId();
        } else if ("DOCTOR".equals(rol)) {
            medicoId = medicoRepository.findByUsuarioEmail(correoUsuario)
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "No se encontró el perfil médico asociado."))
                    .getId();
            if (pacienteId == null
                    || !citaRepository.existsByPacienteIdAndMedicoId(pacienteId, medicoId)) {
                throw new AccessDeniedException(
                        "Solo puedes agendar citas para pacientes que ya tienes asignados.");
            }
        } else if (!"ADMIN".equals(rol)) {
            throw new AccessDeniedException("El rol no tiene permiso para crear citas.");
        }

        if (pacienteId == null) {
            throw new RecursoNoEncontradoException("Paciente no encontrado.");
        }
        if (medicoId == null) {
            throw new RecursoNoEncontradoException("Médico no encontrado.");
        }

        Paciente paciente = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Paciente no encontrado"));
        Medico medico = medicoRepository.findById(medicoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Médico no encontrado"));

        LocalDateTime inicio = dto.getFechaHora();
        LocalDateTime fin = inicio.plusMinutes(dto.getDuracion());
        List<Cita> empalmes = citaRepository.findByMedicoIdAndFechaHoraBetween(medico.getId(), inicio.minusMinutes(dto.getDuracion()), fin);
        
        if (!empalmes.isEmpty()) {
            throw new ConflictoException("El médico ya tiene una cita en ese horario");
        }

        Cita cita = new Cita();
        cita.setPaciente(paciente);
        cita.setMedico(medico);
        cita.setFechaHora(dto.getFechaHora());
        cita.setTipoConsulta(dto.getTipoConsulta());
        cita.setMotivo(dto.getMotivo());
        cita.setDuracion(dto.getDuracion());
        cita.setModalidad(dto.getModalidad());
        cita.setUbicacion(dto.getUbicacion());
        cita.setEstado("PENDIENTE");

        Cita guardada = citaRepository.save(cita);
        eventos.publishEvent(new CitaNotificacionEvento(guardada.getId(), CitaNotificacionEvento.Tipo.CREADA));
        return convertirADto(guardada);
    }

    private void validarPropiedad(Cita cita, String correoUsuario, String rol) {
        if ("ADMIN".equals(rol)) {
            return;
        }
        if ("PATIENT".equals(rol)) {
            Long pacienteId = pacienteRepository.findByUsuarioEmail(correoUsuario)
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "No se encontró el perfil de paciente asociado."))
                    .getId();
            if (!cita.getPaciente().getId().equals(pacienteId)) {
                throw new AccessDeniedException("No tienes permiso para modificar esta cita.");
            }
            return;
        }
        if ("DOCTOR".equals(rol)) {
            Long medicoId = medicoRepository.findByUsuarioEmail(correoUsuario)
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "No se encontró el perfil médico asociado."))
                    .getId();
            if (!cita.getMedico().getId().equals(medicoId)) {
                throw new AccessDeniedException("No tienes permiso para modificar esta cita.");
            }
            return;
        }
        throw new AccessDeniedException("El rol no tiene acceso a esta cita.");
    }

    private CitaResponseDTO convertirADto(Cita cita) {
        return new CitaResponseDTO(
                cita.getId(),
                cita.getPaciente().getId(),
                cita.getPaciente().getUsuario().getNombreCompleto(),
                cita.getMedico().getId(),
                cita.getMedico().getUsuario().getNombreCompleto(),
                cita.getFechaHora(),
                cita.getTipoConsulta(),
                cita.getMotivo(),
                cita.getDuracion(),
                cita.getModalidad(),
                cita.getUbicacion(),
                cita.getEstado()
        );
    }
}