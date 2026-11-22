package mx.vitacare.api.dto;

public class AuthResponse {
    private String token;

    // Constructor manual
    public AuthResponse(String token) {
        this.token = token;
    }

    // Getter y Setter manuales
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}