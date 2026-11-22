package mx.vitacare.api.dto;

import java.time.LocalDateTime;

public record UsuarioResponseDTO(
        Long id,
        String nombreCompleto,
        String email,
        String telefono,
        String departamento,
        String fotoUrl,
        String rol,
        Boolean activo,
        LocalDateTime ultimoAcceso,
        LocalDateTime creadoEn
) {
}
