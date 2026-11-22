package mx.vitacare.api.dto;

import java.util.List;
import java.util.Map;

public record ResumenDashboardDTO(
        long pacientesActivos,
        long medicosActivos,
        long cuentasUsuario,
        long citasHoy,
        Map<String, Long> citasPorEstado,
        List<ActividadCitaDTO> actividadReciente
) {
}