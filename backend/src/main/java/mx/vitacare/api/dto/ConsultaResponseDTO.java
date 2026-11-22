package mx.vitacare.api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ConsultaResponseDTO(
        Long id,
        Long expedienteId,
        Long doctorId,
        String doctorName,
        LocalDate fecha,
        String motivo,
        String diagnostico,
        String tratamiento,
        String medicamentos,
        String estudios,
        LocalDate proximaRevision,
        String observaciones,
        String presion,
        Integer pulso,
        BigDecimal temperatura,
        BigDecimal peso,
        BigDecimal estatura
) {
}
