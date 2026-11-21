package mx.vitacare.api.config;

import mx.vitacare.api.seguridad.JwtAutenticacionFiltro;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SeguridadConfig {

    private final JwtAutenticacionFiltro jwtAutenticacionFiltro;

    @Value("${cors.origenes-permitidos:http://localhost:5173}")
    private String origenesPermitidos;

    public SeguridadConfig(JwtAutenticacionFiltro jwtAutenticacionFiltro) {
        this.jwtAutenticacionFiltro = jwtAutenticacionFiltro;
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
                .addFilterBefore(
                        jwtAutenticacionFiltro,
                        UsernamePasswordAuthenticationFilter.class);

        return seguridad.build();
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
}