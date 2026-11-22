package mx.vitacare.api.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class CitaRequestDTO {

    private Long pacienteId;

    private Long medicoId;

    @NotNull(message = "La fecha y hora son obligatorias")
    @Future(message = "La fecha y hora deben ser posteriores a este momento")
    private LocalDateTime fechaHora;

    @NotBlank(message = "El tipo de consulta es obligatorio")
    @Size(max = 100, message = "El tipo de consulta no puede superar 100 caracteres")
    private String tipoConsulta;

    @NotBlank(message = "El motivo es obligatorio")
    @Size(max = 500, message = "El motivo no puede superar 500 caracteres")
    private String motivo;

    @NotNull(message = "La duración es obligatoria")
    @Min(value = 15, message = "La duración mínima es de 15 minutos")
    @Max(value = 120, message = "La duración máxima es de 120 minutos")
    private Integer duracion;

    @Pattern(regexp = "Presencial|Teleconsulta", message = "La modalidad debe ser Presencial o Teleconsulta")
    private String modalidad;

    @Size(max = 200, message = "La ubicación no puede superar 200 caracteres")
    private String ubicacion;

    public Long getPacienteId() { return pacienteId; }
    public void setPacienteId(Long pacienteId) { this.pacienteId = pacienteId; }

    public Long getMedicoId() { return medicoId; }
    public void setMedicoId(Long medicoId) { this.medicoId = medicoId; }

    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }

    public String getTipoConsulta() { return tipoConsulta; }
    public void setTipoConsulta(String tipoConsulta) { this.tipoConsulta = tipoConsulta; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    public Integer getDuracion() { return duracion; }
    public void setDuracion(Integer duracion) { this.duracion = duracion; }

    public String getModalidad() { return modalidad; }
    public void setModalidad(String modalidad) { this.modalidad = modalidad; }

    public String getUbicacion() { return ubicacion; }
    public void setUbicacion(String ubicacion) { this.ubicacion = ubicacion; }
}