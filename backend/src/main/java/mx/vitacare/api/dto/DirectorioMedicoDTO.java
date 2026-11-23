package mx.vitacare.api.dto;

public record DirectorioMedicoDTO(
        Long id,
        String nombre,
        String especialidad,
        String disponibilidad
) {
}
