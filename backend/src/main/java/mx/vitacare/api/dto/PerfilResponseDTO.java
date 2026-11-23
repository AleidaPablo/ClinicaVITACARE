package mx.vitacare.api.dto;

import java.time.LocalDate;

public record PerfilResponseDTO(
        Long id,
        String nombreCompleto,
        String email,
        String telefono,
        String departamento,
        String fotoUrl,
        String rol,
        Long pacienteId,
        LocalDate fechaNacimiento,
        String sexo,
        String estadoCivil,
        String ocupacion,
        String direccion,
        String tipoSangre,
        String contactoEmergenciaNombre,
        String contactoEmergenciaTelefono,
        String tipoSeguro,
        String nss,
        Long medicoId,
        String cedulaProfesional,
        Integer anosExperiencia,
        String consultorio,
        String idiomas,
        String disponibilidad,
        String especialidad
) {
}
