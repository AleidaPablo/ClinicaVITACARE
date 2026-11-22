package mx.vitacare.api.dto;

public class ExpedienteRequestDTO {

    private String antecedentes;
    private String alergias;
    private String padecimientos;
    private String medicamentos;
    private String cirugias;
    private String antecedentesFamiliares;

    public String getAntecedentes() { return antecedentes; }
    public void setAntecedentes(String antecedentes) { this.antecedentes = antecedentes; }

    public String getAlergias() { return alergias; }
    public void setAlergias(String alergias) { this.alergias = alergias; }

    public String getPadecimientos() { return padecimientos; }
    public void setPadecimientos(String padecimientos) { this.padecimientos = padecimientos; }

    public String getMedicamentos() { return medicamentos; }
    public void setMedicamentos(String medicamentos) { this.medicamentos = medicamentos; }

    public String getCirugias() { return cirugias; }
    public void setCirugias(String cirugias) { this.cirugias = cirugias; }

    public String getAntecedentesFamiliares() { return antecedentesFamiliares; }
    public void setAntecedentesFamiliares(String antecedentesFamiliares) { this.antecedentesFamiliares = antecedentesFamiliares; }
}
