package mx.vitacare.api.service;

import mx.vitacare.api.exception.ReglaNegocioException;
import mx.vitacare.api.model.TokenRecuperacion;
import mx.vitacare.api.model.Usuario;
import mx.vitacare.api.repository.TokenRecuperacionRepository;
import mx.vitacare.api.repository.UsuarioRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Optional;
import java.util.Base64;

@Service
public class TokenRecuperacionService {

    private static final Logger log = LoggerFactory.getLogger(TokenRecuperacionService.class);

    private final UsuarioRepository usuarioRepository;
    private final TokenRecuperacionRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    @Value("${app.frontend.url:http://localhost:5174}")
    private String frontendUrl;

    @Value("${notificaciones.correo.remitente:no-reply@vitacare.local}")
    private String correoRemitente;

   
    @Value("${app.recuperacion.mostrar-enlace-en-log:false}")
    private boolean mostrarEnlaceEnLog;

    private final SecureRandom secureRandom = new SecureRandom();

    public TokenRecuperacionService(
            UsuarioRepository usuarioRepository,
            TokenRecuperacionRepository tokenRepository,
            PasswordEncoder passwordEncoder,
            JavaMailSender mailSender) {

        this.usuarioRepository = usuarioRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
    }

    @Transactional
    public void solicitarRecuperacion(String email) {

        Optional<Usuario> usuarioEncontrado =
                usuarioRepository.findByEmail(email);

        
        if (usuarioEncontrado.isEmpty()) {
            return;
        }

        Usuario usuario = usuarioEncontrado.get();

        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);

        String token = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);

        String tokenHash = generarHash(token);

        tokenRepository.marcarTokensAnterioresComoUsados(usuario.getId());

        TokenRecuperacion nuevoToken = new TokenRecuperacion(
                usuario,
                tokenHash,
                LocalDateTime.now().plusMinutes(30)
        );

        tokenRepository.save(nuevoToken);

        String enlace = frontendUrl
                + "/crear-nueva-contrasena?token="
                + token;

        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setFrom(correoRemitente);
        mensaje.setTo(usuario.getEmail());
        mensaje.setSubject("Recuperación de contraseña - VITACARE");
        mensaje.setText(
                "Hola " + usuario.getNombreCompleto() + ",\n\n"
                + "Recibimos una solicitud para recuperar tu contraseña.\n\n"
                + "Para crear una nueva contraseña, abre este enlace:\n"
                + enlace + "\n\n"
                + "Este enlace vence en 30 minutos y solamente puede utilizarse una vez.\n\n"
                + "Si no solicitaste este cambio, ignora este correo.\n\n"
                + "Equipo VITACARE"
        );

        try {
            mailSender.send(mensaje);
        } catch (Exception ex) {
            
            log.error("No se pudo enviar el correo de recuperación a {}: {}", usuario.getEmail(), ex.getMessage());
        }

        if (mostrarEnlaceEnLog) {
            log.info("[DESARROLLO] Enlace de recuperación para {}: {}", usuario.getEmail(), enlace);
        }
    }

    @Transactional
    public void restablecerContrasena(
            String token,
            String nuevaContrasena) {

        String tokenHash = generarHash(token);

        TokenRecuperacion registro = tokenRepository
                .findByTokenHashAndUsadoFalseAndExpiraEnAfter(
                        tokenHash,
                        LocalDateTime.now())
                .orElseThrow(() ->
                        new ReglaNegocioException(
                                "El enlace es inválido o ha expirado"));

        Usuario usuario = registro.getUsuario();

        String contrasenaEncriptada =
                passwordEncoder.encode(nuevaContrasena);

        usuarioRepository.actualizarContrasena(
                usuario.getId(),
                contrasenaEncriptada
        );

        registro.setUsado(true);
        tokenRepository.save(registro);
    }

    private String generarHash(String token) {

        try {
            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    token.getBytes(StandardCharsets.UTF_8));

            return HexFormat.of().formatHex(hash);

        } catch (Exception e) {
            throw new IllegalStateException(
                    "No se pudo generar el hash del token", e);
        }
    }
}
