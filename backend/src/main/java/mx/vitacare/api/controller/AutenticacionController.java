package mx.vitacare.api.controller;

import mx.vitacare.api.dto.AuthResponse;
import mx.vitacare.api.dto.LoginRequest;
import mx.vitacare.api.dto.RegisterRequest;
import mx.vitacare.api.model.Rol;
import mx.vitacare.api.model.Usuario;
import mx.vitacare.api.repository.RolRepository;
import mx.vitacare.api.repository.UsuarioRepository;
import mx.vitacare.api.seguridad.JwtServicio;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/autenticacion")
public class AutenticacionController {

    private final AuthenticationManager authenticationManager;
    private final JwtServicio jwtServicio;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final RolRepository rolRepository;

    public AutenticacionController(AuthenticationManager authenticationManager,
                                   JwtServicio jwtServicio,
                                   UsuarioRepository usuarioRepository,
                                   PasswordEncoder passwordEncoder,
                                   RolRepository rolRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtServicio = jwtServicio;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.rolRepository = rolRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {

        // 1. Spring Security verifica que el correo y la contraseña sean correctos
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        // 2. Si la contraseña es correcta, buscamos al usuario en la BD
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        // 3. Preparamos los datos extra que irán dentro del token (el rol y el nombre)
        Map<String, Object> claims = new HashMap<>();
        claims.put("rol", usuario.getRol().getNombre()); // Ej: "ADMIN", "DOCTOR", "PATIENT"
        claims.put("nombre", usuario.getNombreCompleto());

        // 4. Generamos el Token JWT
        String token = jwtServicio.generarToken(usuario.getEmail(), claims);

        // 5. Devolvemos el token al frontend
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/registro")
    public ResponseEntity<String> registrar(@Valid @RequestBody RegisterRequest request) {

        // 1. Verificar si el correo ya existe
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("El correo ya está registrado");
        }

        // 2. Buscar el rol de PACIENTE por defecto
        Rol rolPaciente = rolRepository.findByNombre("PATIENT")
                .orElseThrow(() -> new RuntimeException("Error: El rol PATIENT no existe en la base de datos."));

        // 3. Crear el nuevo usuario (usando setters para evitar problemas con Lombok)
        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setNombreCompleto(request.getNombreCompleto());
        nuevoUsuario.setEmail(request.getEmail());
        nuevoUsuario.setContrasena(passwordEncoder.encode(request.getPassword()));
        nuevoUsuario.setTelefono(request.getTelefono());
        nuevoUsuario.setRol(rolPaciente);
        nuevoUsuario.setActivo(true);

        // 4. Guardar en la base de datos
        usuarioRepository.save(nuevoUsuario);

        return ResponseEntity.ok("Usuario registrado exitosamente");
    }
}