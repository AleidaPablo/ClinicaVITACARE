package mx.vitacare.api.service;

import mx.vitacare.api.dto.CitaRequestDTO;
import mx.vitacare.api.dto.CitaResponseDTO;
import mx.vitacare.api.exception.RecursoNoEncontradoException;
import mx.vitacare.api.model.Cita;
import mx.vitacare.api.model.Medico;
import mx.vitacare.api.model.Paciente;
import mx.vitacare.api.repository.CitaRepository;
import mx.vitacare.api.repository.CitaSpecs;
import mx.vitacare.api.repository.MedicoRepository;
import mx.vitacare.api.repository.PacienteRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CitaService {

    private final CitaRepository citaRepository;
    private final PacienteRepository pacienteRepository;
    private final MedicoRepository medicoRepository;

    public CitaService(CitaRepository citaRepository, PacienteRepository pacienteRepository, MedicoRepository medicoRepository) {
        this.citaRepository = citaRepository;
        this.pacienteRepository = pacienteRepository;
        this.medicoRepository = medicoRepository;
    }

    @Transactional(readOnly = true)
    public Page<CitaResponseDTO> listarPaginadas(Long pacienteId, Long medicoId, String estado, Pageable pageable) {
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

    @Transactional(readOnly = true)
    public Page<CitaResponseDTO> listarPaginadas(Pageable pageable) {
        return listarPaginadas(null, null, null, pageable);
    }

    @Transactional
    public CitaResponseDTO cambiarEstado(Long id, String nuevoEstado) {
        Cita cita = citaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cita no encontrada con ID: " + id));
        cita.setEstado(nuevoEstado.toUpperCase());
        return convertirADto(citaRepository.save(cita));
    }

    @Transactional
    public CitaResponseDTO actualizar(Long id, CitaRequestDTO dto) {
        Cita cita = citaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cita no encontrada con ID: " + id));

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
    public CitaResponseDTO crear(CitaRequestDTO dto) {
        Paciente paciente = pacienteRepository.findById(dto.getPacienteId())
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
        
        Medico medico = medicoRepository.findById(dto.getMedicoId())
                .orElseThrow(() -> new RuntimeException("Médico no encontrado"));

        // Validación manual para evitar empalmes (el trigger de BD es el segundo filtro)
        LocalDateTime inicio = dto.getFechaHora();
        LocalDateTime fin = inicio.plusMinutes(dto.getDuracion());
        List<Cita> empalmes = citaRepository.findByMedicoIdAndFechaHoraBetween(medico.getId(), inicio.minusMinutes(dto.getDuracion()), fin);
        
        if (!empalmes.isEmpty()) {
            throw new RuntimeException("El médico ya tiene una cita en ese horario");
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
        return convertirADto(guardada);
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