package mx.vitacare.api.seguridad;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
public class JwtAutenticacionFiltro extends OncePerRequestFilter {

    private final JwtServicio jwtServicio;

    public JwtAutenticacionFiltro(JwtServicio jwtServicio) {
        this.jwtServicio = jwtServicio;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest solicitud,
            @NonNull HttpServletResponse respuesta,
            @NonNull FilterChain cadenaFiltros)
            throws ServletException, IOException {

        String encabezadoAutorizacion = solicitud.getHeader("Authorization");

        if (encabezadoAutorizacion != null
                && encabezadoAutorizacion.startsWith("Bearer ")
                && SecurityContextHolder.getContext().getAuthentication() == null) {
            String token = encabezadoAutorizacion.substring(7);

            if (jwtServicio.validarToken(token)) {
                String nombreUsuario = jwtServicio.obtenerNombreUsuario(token);
                Object rolReclamado = jwtServicio.obtenerReclamo(token, "rol");
                List<SimpleGrantedAuthority> autoridades =
                        convertirRolAAutoridades(rolReclamado);

                UsernamePasswordAuthenticationToken autenticacion =
                        new UsernamePasswordAuthenticationToken(
                                nombreUsuario,
                                null,
                                autoridades);
                SecurityContextHolder.getContext().setAuthentication(autenticacion);
            }
        }

        cadenaFiltros.doFilter(solicitud, respuesta);
    }

    private List<SimpleGrantedAuthority> convertirRolAAutoridades(Object rolReclamado) {
        if (!(rolReclamado instanceof String rol) || rol.isBlank()) {
            return Collections.emptyList();
        }

        String nombreRol = rol.startsWith("ROLE_") ? rol : "ROLE_" + rol;
        return List.of(new SimpleGrantedAuthority(nombreRol));
    }
}