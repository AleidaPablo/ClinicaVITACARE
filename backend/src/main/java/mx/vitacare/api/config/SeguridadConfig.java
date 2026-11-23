package mx.vitacare.api.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import mx.vitacare.api.seguridad.JwtAutenticacionFiltro;
import mx.vitacare.api.seguridad.UsuarioDetallesServicio;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity 
public class SeguridadConfig {

    private static final ObjectMapper MAPEADOR_JSON = new ObjectMapper();

    private final JwtAutenticacionFiltro jwtAutenticacionFiltro;
    private final UsuarioDetallesServicio usuarioDetallesServicio;

    @Value("${cors.origenes-permitidos:http://localhost:5174}")
    private String origenesPermitidos;

    public SeguridadConfig(JwtAutenticacionFiltro jwtAutenticacionFiltro, UsuarioDetallesServicio usuarioDetallesServicio) {
        this.jwtAutenticacionFiltro = jwtAutenticacionFiltro;
        this.usuarioDetallesServicio = usuarioDetallesServicio;
    }

    @Bean
    public SecurityFilterChain cadenaFiltrosSeguridad(HttpSecurity seguridad) throws Exception {
        seguridad
                .cors(cors -> cors.configurationSource(fuenteConfiguracionCors()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/autenticacion/**", "/error").permitAll()
                        .anyRequest().authenticated())
                // Sin token o token inválido -> 401; sin permiso -> 403 (ambos en JSON)
                .exceptionHandling(excepciones -> excepciones
                        .authenticationEntryPoint((solicitud, respuesta, excepcion) ->
                                escribirError(respuesta, 401, "Unauthorized",
                                        "Debes iniciar sesión para acceder a este recurso",
                                        solicitud.getRequestURI()))
                        .accessDeniedHandler((solicitud, respuesta, excepcion) ->
                                escribirError(respuesta, 403, "Forbidden",
                                        "No tienes permiso para acceder a este recurso",
                                        solicitud.getRequestURI())))
                .authenticationProvider(autenticacionProveedor())
                .addFilterBefore(
                        jwtAutenticacionFiltro,
                        UsernamePasswordAuthenticationFilter.class);

        return seguridad.build();
    }

    // Le dice a Spring cómo buscar al usuario y validar su contraseña
    @Bean
    public AuthenticationProvider autenticacionProveedor() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(usuarioDetallesServicio);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    // Necesario para el método de login
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource fuenteConfiguracionCors() {
        CorsConfiguration configuracion = new CorsConfiguration();
        configuracion.setAllowedOrigins(
                Arrays.stream(origenesPermitidos.split(","))
                        .map(String::trim)
                        .filter(origen -> !origen.isEmpty())
                        .toList());
        configuracion.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuracion.setAllowedHeaders(List.of("*"));
        configuracion.setExposedHeaders(List.of("Authorization"));
        configuracion.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource fuente = new UrlBasedCorsConfigurationSource();
        fuente.registerCorsConfiguration("/**", configuracion);
        return fuente;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Misma forma que ErrorResponse, para que el frontend lea siempre "mensaje"
    private void escribirError(HttpServletResponse respuesta, int estado, String error,
                               String mensaje, String ruta) throws IOException {
        Map<String, Object> cuerpo = new LinkedHashMap<>();
        cuerpo.put("timestamp", LocalDateTime.now().toString());
        cuerpo.put("status", estado);
        cuerpo.put("error", error);
        cuerpo.put("mensaje", mensaje);
        cuerpo.put("path", ruta);

        respuesta.setStatus(estado);
        respuesta.setContentType("application/json;charset=UTF-8");
        respuesta.getWriter().write(MAPEADOR_JSON.writeValueAsString(cuerpo));
    }
}