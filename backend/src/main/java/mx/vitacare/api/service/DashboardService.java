package mx.vitacare.api.service;

import mx.vitacare.api.dto.ActividadCitaDTO;
import mx.vitacare.api.dto.ResumenDashboardDTO;
import mx.vitacare.api.repository.CitaRepository;
import mx.vitacare.api.repository.MedicoRepository;
import mx.vitacare.api.repository.PacienteRepository;
import mx.vitacare.api.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private static final List<String> ESTADOS_CITA = List.of("PENDIENTE", "CONFIRMADA", "COMPLETADA", "CANCELADA");
    
    private static final ZoneId ZONA_CLINICA = ZoneId.of("America/Mexico_City");

    private final PacienteRepository pacienteRepository;
    private final MedicoRepository medicoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CitaRepository citaRepository;

    public DashboardService(PacienteRepository pacienteRepository,
                            MedicoRepository medicoRepository,
                            UsuarioRepository usuarioRepository,
                            CitaRepository citaRepository) {
        this.pacienteRepository = pacienteRepository;
        this.medicoRepository = medicoRepository;
        this.usuarioRepository = usuarioRepository;
        this.citaRepository = citaRepository;
    }

    @Transactional(readOnly = true)
    public ResumenDashboardDTO obtenerResumen() {
        LocalDate hoy = LocalDate.now(ZONA_CLINICA);
        long citasHoy = citaRepository.countByFechaHoraBetweenAndEstadoNot(
                hoy.atStartOfDay(), hoy.plusDays(1).atStartOfDay(), "CANCELADA");

        Map<String, Long> citasPorEstado = new LinkedHashMap<>();
        for (String estado : ESTADOS_CITA) {
            citasPorEstado.put(estado, citaRepository.countByEstado(estado));
        }

        List<ActividadCitaDTO> actividad = citaRepository.findTop3ByOrderByActualizadoEnDesc().stream()
                .map(cita -> new ActividadCitaDTO(
                        cita.getId(),
                        cita.getEstado(),
                        cita.getPaciente().getUsuario().getNombreCompleto(),
                        cita.getMotivo(),
                        cita.getFechaHora()))
                .toList();

        return new ResumenDashboardDTO(
                pacienteRepository.countByActivoTrue(),
                medicoRepository.countByActivoTrue(),
                usuarioRepository.count(),
                citasHoy,
                citasPorEstado,
                actividad);
    }
}