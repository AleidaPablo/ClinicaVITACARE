package mx.vitacare.api.dto;

import java.time.LocalDate;
import java.util.List;

public record ExpedienteResponseDTO(
        Long id,
        Long patientId,
        String patientName,
        String antecedentes,
        String alergias,
        String padecimientos,
        String medicamentos,
        String cirugias,
        String antecedentesFamiliares,
        LocalDate ultimaVisita,
        List<ConsultaResponseDTO> entradas
) {
}
