package mx.vitacare.api.dto;

import java.time.LocalDateTime;

public class CitaResponseDTO {
    private Long id;
    private String pacienteNombre;
    private String medicoNombre;
    private LocalDateTime fechaHora;
    private String tipoConsulta;
    private String estado;

    public CitaResponseDTO(Long id, String pacienteNombre, String medicoNombre, LocalDateTime fechaHora, String tipoConsulta, String estado) {
        this.id = id;
        this.pacienteNombre = pacienteNombre;
        this.medicoNombre = medicoNombre;
        this.fechaHora = fechaHora;
        this.tipoConsulta = tipoConsulta;
        this.estado = estado;
    }

    // Getters
    public Long getId() { return id; }
    public String getPacienteNombre() { return pacienteNombre; }
    public String getMedicoNombre() { return medicoNombre; }
    public LocalDateTime getFechaHora() { return fechaHora; }
    public String getTipoConsulta() { return tipoConsulta; }
    public String getEstado() { return estado; }
}