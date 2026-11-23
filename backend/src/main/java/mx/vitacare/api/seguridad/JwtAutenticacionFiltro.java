
package mx.vitacare.api.seguridad;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import mx.vitacare.api.service.TokenRevocadoService;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Component
public class JwtAutenticacionFiltro extends OncePerRequestFilter {

    private static final Set<String> ROLES_PERMITIDOS =
            Set.of("ADMIN", "DOCTOR", "PATIENT");

    private final JwtServicio jwtServicio;
    private final TokenRevocadoService tokenRevocadoService;

    public JwtAutenticacionFiltro(
            JwtServicio jwtServicio,
            TokenRevocadoService tokenRevocadoService) {
        this.jwtServicio = jwtServicio;
        this.tokenRevocadoService = tokenRevocadoService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest solicitud,
            @NonNull HttpServletResponse respuesta,
            @NonNull FilterChain cadenaFiltros)
            throws ServletException, IOException {

        String encabezadoAutorizacion =
                solicitud.getHeader("Authorization");

        if (encabezadoAutorizacion != null
                && encabezadoAutorizacion.startsWith("Bearer ")
                && SecurityContextHolder.getContext().getAuthentication() == null) {

            String token = encabezadoAutorizacion.substring(7);

            if (jwtServicio.validarToken(token)) {

                String jti = jwtServicio.obtenerJti(token);

                if (jti != null
                        && !tokenRevocadoService.estaRevocado(jti)) {

                    String nombreUsuario =
                            jwtServicio.obtenerNombreUsuario(token);

                    Object rolReclamado =
                            jwtServicio.obtenerReclamo(token, "rol");

                    List<SimpleGrantedAuthority> autoridades =
                            convertirRolAAutoridades(rolReclamado);

                    if (!autoridades.isEmpty()) {
                        UsernamePasswordAuthenticationToken autenticacion =
                                new UsernamePasswordAuthenticationToken(
                                        nombreUsuario,
                                        null,
                                        autoridades);

                        SecurityContextHolder.getContext()
                                .setAuthentication(autenticacion);
                    }
                }
            }
        }

        cadenaFiltros.doFilter(solicitud, respuesta);
    }

    private List<SimpleGrantedAuthority> convertirRolAAutoridades(
            Object rolReclamado) {

        if (!(rolReclamado instanceof String rol) || rol.isBlank()) {
            return List.of();
        }

        String rolNormalizado =
                rol.trim().toUpperCase(Locale.ROOT);

        if (rolNormalizado.startsWith("ROLE_")) {
            rolNormalizado = rolNormalizado.substring(5);
        }

        if (!ROLES_PERMITIDOS.contains(rolNormalizado)) {
            return List.of();
        }

        return List.of(
                new SimpleGrantedAuthority("ROLE_" + rolNormalizado));
    }
}
