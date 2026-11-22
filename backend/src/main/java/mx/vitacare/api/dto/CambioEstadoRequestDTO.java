package mx.vitacare.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class CambioEstadoRequestDTO {

    @NotBlank(message = "El estado es obligatorio")
    @Pattern(regexp = "(?i)PENDIENTE|CONFIRMADA|COMPLETADA|CANCELADA",
             message = "El estado debe ser PENDIENTE, CONFIRMADA, COMPLETADA o CANCELADA")
    private String estado;

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}