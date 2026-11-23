package mx.vitacare.api.dto;

public class MedicoResponseDTO {
    private Long id;
    private String nombreCompleto;
    private String email;
    private String telefono;
    private String cedulaProfesional;
    private Integer anosExperiencia;
    private String consultorio;
    private String idiomas;
    private String disponibilidad;
    private Boolean activo;

    public MedicoResponseDTO(Long id, String nombreCompleto, String email, String telefono, String cedulaProfesional, Integer anosExperiencia, String consultorio, String idiomas, String disponibilidad, Boolean activo) {
        this.id = id;
        this.nombreCompleto = nombreCompleto;
        this.email = email;
        this.telefono = telefono;
        this.cedulaProfesional = cedulaProfesional;
        this.anosExperiencia = anosExperiencia;
        this.consultorio = consultorio;
        this.idiomas = idiomas;
        this.disponibilidad = disponibilidad;
        this.activo = activo;
    }
    public Long getId() { return id; }
    public String getNombreCompleto() { return nombreCompleto; }
    public String getEmail() { return email; }
    public String getTelefono() { return telefono; }
    public String getCedulaProfesional() { return cedulaProfesional; }
    public Integer getAnosExperiencia() { return anosExperiencia; }
    public String getConsultorio() { return consultorio; }
    public String getIdiomas() { return idiomas; }
    public String getDisponibilidad() { return disponibilidad; }
    public Boolean getActivo() { return activo; }
}