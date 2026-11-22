package mx.vitacare.api.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "expedientes")
public class Expediente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "paciente_id", nullable = false, unique = true)
    private Paciente paciente;

    @Column(name = "antecedentes_personales", columnDefinition = "TEXT")
    private String antecedentesPersonales;

    @Column(columnDefinition = "TEXT")
    private String alergias;

    @Column(name = "padecimientos_cronicos", columnDefinition = "TEXT")
    private String padecimientosCronicos;

    @Column(name = "medicamentos_uso_continuo", columnDefinition = "TEXT")
    private String medicamentosUsoContinuo;

    @Column(name = "cirugias_previas", columnDefinition = "TEXT")
    private String cirugiasPrevias;

    @Column(name = "antecedentes_familiares", columnDefinition = "TEXT")
    private String antecedentesFamiliares;

    @CreationTimestamp
    @Column(name = "creado_en", updatable = false)
    private LocalDateTime creadoEn;

    @UpdateTimestamp
    @Column(name = "actualizado_en")
    private LocalDateTime actualizadoEn;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Paciente getPaciente() { return paciente; }
    public void setPaciente(Paciente paciente) { this.paciente = paciente; }

    public String getAntecedentesPersonales() { return antecedentesPersonales; }
    public void setAntecedentesPersonales(String antecedentesPersonales) { this.antecedentesPersonales = antecedentesPersonales; }

    public String getAlergias() { return alergias; }
    public void setAlergias(String alergias) { this.alergias = alergias; }

    public String getPadecimientosCronicos() { return padecimientosCronicos; }
    public void setPadecimientosCronicos(String padecimientosCronicos) { this.padecimientosCronicos = padecimientosCronicos; }

    public String getMedicamentosUsoContinuo() { return medicamentosUsoContinuo; }
    public void setMedicamentosUsoContinuo(String medicamentosUsoContinuo) { this.medicamentosUsoContinuo = medicamentosUsoContinuo; }

    public String getCirugiasPrevias() { return cirugiasPrevias; }
    public void setCirugiasPrevias(String cirugiasPrevias) { this.cirugiasPrevias = cirugiasPrevias; }

    public String getAntecedentesFamiliares() { return antecedentesFamiliares; }
    public void setAntecedentesFamiliares(String antecedentesFamiliares) { this.antecedentesFamiliares = antecedentesFamiliares; }

    public LocalDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(LocalDateTime creadoEn) { this.creadoEn = creadoEn; }

    public LocalDateTime getActualizadoEn() { return actualizadoEn; }
    public void setActualizadoEn(LocalDateTime actualizadoEn) { this.actualizadoEn = actualizadoEn; }
}
