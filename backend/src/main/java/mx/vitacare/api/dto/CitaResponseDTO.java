package mx.vitacare.api.dto;

import java.time.LocalDateTime;

public record CitaResponseDTO(
        Long id,
        Long pacienteId,
        String pacienteNombre,
        Long medicoId,
        String medicoNombre,
        LocalDateTime fechaHora,
        String tipoConsulta,
        String motivo,
        Integer duracion,
        String modalidad,
        String ubicacion,
        String estado
) {
}