package mx.vitacare.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class ConsultaRequestDTO {

    @NotNull(message = "El médico es obligatorio")
    private Long doctorId;

    private Long citaId;

    private LocalDate fecha;

    @NotBlank(message = "El motivo de la consulta es obligatorio")
    private String motivo;

    @NotBlank(message = "El diagnóstico es obligatorio")
    private String diagnostico;

    @NotBlank(message = "El tratamiento e indicaciones son obligatorios")
    private String tratamiento;

    private String medicamentos;

    private String estudios;

    private LocalDate proximaRevision;

    private String observaciones;

    private String presion;

    private Integer pulso;

    private BigDecimal temperatura;

    private BigDecimal peso;

    private BigDecimal estatura;

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public Long getCitaId() { return citaId; }
    public void setCitaId(Long citaId) { this.citaId = citaId; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    public String getDiagnostico() { return diagnostico; }
    public void setDiagnostico(String diagnostico) { this.diagnostico = diagnostico; }

    public String getTratamiento() { return tratamiento; }
    public void setTratamiento(String tratamiento) { this.tratamiento = tratamiento; }

    public String getMedicamentos() { return medicamentos; }
    public void setMedicamentos(String medicamentos) { this.medicamentos = medicamentos; }

    public String getEstudios() { return estudios; }
    public void setEstudios(String estudios) { this.estudios = estudios; }

    public LocalDate getProximaRevision() { return proximaRevision; }
    public void setProximaRevision(LocalDate proximaRevision) { this.proximaRevision = proximaRevision; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public String getPresion() { return presion; }
    public void setPresion(String presion) { this.presion = presion; }

    public Integer getPulso() { return pulso; }
    public void setPulso(Integer pulso) { this.pulso = pulso; }

    public BigDecimal getTemperatura() { return temperatura; }
    public void setTemperatura(BigDecimal temperatura) { this.temperatura = temperatura; }

    public BigDecimal getPeso() { return peso; }
    public void setPeso(BigDecimal peso) { this.peso = peso; }

    public BigDecimal getEstatura() { return estatura; }
    public void setEstatura(BigDecimal estatura) { this.estatura = estatura; }
}
