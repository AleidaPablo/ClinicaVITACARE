package mx.vitacare.api.service;

import mx.vitacare.api.dto.CitaRequestDTO;
import mx.vitacare.api.dto.CitaResponseDTO;
import mx.vitacare.api.model.Cita;
import mx.vitacare.api.model.Medico;
import mx.vitacare.api.model.Paciente;
import mx.vitacare.api.repository.CitaRepository;
import mx.vitacare.api.repository.MedicoRepository;
import mx.vitacare.api.repository.PacienteRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

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

    public Page<CitaResponseDTO> listarPaginadas(Pageable pageable) {
        return citaRepository.findAll(pageable).map(this::convertirADto);
    }

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
                cita.getPaciente().getUsuario().getNombreCompleto(),
                cita.getMedico().getUsuario().getNombreCompleto(),
                cita.getFechaHora(),
                cita.getTipoConsulta(),
                cita.getEstado()
        );
    }
}