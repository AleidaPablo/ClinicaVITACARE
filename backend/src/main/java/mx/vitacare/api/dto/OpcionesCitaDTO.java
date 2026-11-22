package mx.vitacare.api.dto;

import java.util.List;

public record OpcionesCitaDTO(
        List<Opcion> medicos,
        List<Opcion> pacientes
) {
    public record Opcion(Long id, String nombre) {
    }
}