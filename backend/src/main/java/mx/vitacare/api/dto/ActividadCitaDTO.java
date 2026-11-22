package mx.vitacare.api.dto;

import java.time.LocalDateTime;

public record ActividadCitaDTO(
        Long id,
        String estado,
        String paciente,
        String motivo,
        LocalDateTime fechaHora
) {
}