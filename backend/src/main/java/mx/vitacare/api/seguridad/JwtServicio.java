package mx.vitacare.api.seguridad;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

@Service
public class JwtServicio {

    private static final long DURACION_JWT_MILISEGUNDOS = 60 * 60 * 1000L;

    private final SecretKey claveFirmado;

    public JwtServicio(@Value("${jwt.secreto}") String secretoJwt) {
        byte[] bytesSecreto = secretoJwt.getBytes(StandardCharsets.UTF_8);
        if (bytesSecreto.length < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET debe contener al menos 32 bytes.");
        }
        this.claveFirmado = Keys.hmacShaKeyFor(bytesSecreto);
    }

    public String generarToken(String nombreUsuario, Map<String, Object> reclamaciones) {
        Date ahora = new Date();
        Date expiracion = new Date(ahora.getTime() + DURACION_JWT_MILISEGUNDOS);

        return Jwts.builder()
                .claims(reclamaciones)
                .subject(nombreUsuario)
                .issuedAt(ahora)
                .expiration(expiracion)
                .signWith(claveFirmado, Jwts.SIG.HS256)
                .compact();
    }

    public boolean validarToken(String token) {
        try {
            obtenerReclamaciones(token);
            return true;
        } catch (io.jsonwebtoken.JwtException | IllegalArgumentException excepcion) {
            return false;
        }
    }

    public String obtenerNombreUsuario(String token) {
        return obtenerReclamaciones(token).getSubject();
    }

    public Object obtenerReclamo(String token, String nombreReclamo) {
        return obtenerReclamaciones(token).get(nombreReclamo);
    }

    private Claims obtenerReclamaciones(String token) {
        return Jwts.parser()
                .verifyWith(claveFirmado)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}