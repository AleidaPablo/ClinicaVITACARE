package mx.vitacare.api.dto;

import java.time.LocalDate;

public class PacienteResponseDTO {
    private Long id;
    private String nombreCompleto;
    private String email;
    private String telefono;
    private LocalDate fechaNacimiento;
    private String sexo;
    private String estadoCivil;
    private String ocupacion;
    private String direccion;
    private String tipoSangre;
    private String contactoEmergenciaNombre;
    private String contactoEmergenciaTelefono;
    private String tipoSeguro;
    private String nss;
    private Boolean activo;

    // Constructor
    public PacienteResponseDTO(Long id, String nombreCompleto, String email, String telefono, LocalDate fechaNacimiento, String sexo, String estadoCivil, String ocupacion, String direccion, String tipoSangre, String contactoEmergenciaNombre, String contactoEmergenciaTelefono, String tipoSeguro, String nss, Boolean activo) {
        this.id = id;
        this.nombreCompleto = nombreCompleto;
        this.email = email;
        this.telefono = telefono;
        this.fechaNacimiento = fechaNacimiento;
        this.sexo = sexo;
        this.estadoCivil = estadoCivil;
        this.ocupacion = ocupacion;
        this.direccion = direccion;
        this.tipoSangre = tipoSangre;
        this.contactoEmergenciaNombre = contactoEmergenciaNombre;
        this.contactoEmergenciaTelefono = contactoEmergenciaTelefono;
        this.tipoSeguro = tipoSeguro;
        this.nss = nss;
        this.activo = activo;
    }

    // GETTERS...
    public Long getId() { return id; }
    public String getNombreCompleto() { return nombreCompleto; }
    public String getEmail() { return email; }
    public String getTelefono() { return telefono; }
    public LocalDate getFechaNacimiento() { return fechaNacimiento; }
    public String getSexo() { return sexo; }
    public String getEstadoCivil() { return estadoCivil; }
    public String getOcupacion() { return ocupacion; }
    public String getDireccion() { return direccion; }
    public String getTipoSangre() { return tipoSangre; }
    public String getContactoEmergenciaNombre() { return contactoEmergenciaNombre; }
    public String getContactoEmergenciaTelefono() { return contactoEmergenciaTelefono; }
    public String getTipoSeguro() { return tipoSeguro; }
    public String getNss() { return nss; }
    public Boolean getActivo() { return activo; }
}