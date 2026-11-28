package mx.vitacare.api.controller;

import jakarta.validation.Valid;
import mx.vitacare.api.dto.AuthResponse;
import mx.vitacare.api.dto.LoginRequest;
import mx.vitacare.api.dto.RegisterRequest;
import mx.vitacare.api.dto.RestablecerContrasenaRequest;
import mx.vitacare.api.dto.SolicitudRecuperacionRequest;
import mx.vitacare.api.exception.ConflictoException;
import mx.vitacare.api.exception.RecursoNoEncontradoException;
import mx.vitacare.api.model.Paciente;
import mx.vitacare.api.model.Rol;
import mx.vitacare.api.model.Usuario;
import mx.vitacare.api.repository.MedicoRepository;
import mx.vitacare.api.repository.PacienteRepository;
import mx.vitacare.api.repository.RolRepository;
import mx.vitacare.api.repository.UsuarioRepository;
import mx.vitacare.api.seguridad.JwtServicio;
import mx.vitacare.api.service.TokenRecuperacionService;
import mx.vitacare.api.service.TokenRevocadoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
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
    private final PacienteRepository pacienteRepository;
    private final MedicoRepository medicoRepository;
    private final TokenRevocadoService tokenRevocadoService;
    private final TokenRecuperacionService tokenRecuperacionService;

    public AutenticacionController(
            AuthenticationManager authenticationManager,
            JwtServicio jwtServicio,
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            RolRepository rolRepository,
            PacienteRepository pacienteRepository,
            MedicoRepository medicoRepository,
            TokenRevocadoService tokenRevocadoService,
            TokenRecuperacionService tokenRecuperacionService) {

        this.authenticationManager = authenticationManager;
        this.jwtServicio = jwtServicio;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.rolRepository = rolRepository;
        this.pacienteRepository = pacienteRepository;
        this.medicoRepository = medicoRepository;
        this.tokenRevocadoService = tokenRevocadoService;
        this.tokenRecuperacionService = tokenRecuperacionService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword())
        );

        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        Map<String, Object> claims = new HashMap<>();
        String rolNombre = usuario.getRol().getNombre();

        claims.put("rol", rolNombre);
        claims.put("nombre", usuario.getNombreCompleto());
        claims.put("usuarioId", usuario.getId());

        if ("PATIENT".equals(rolNombre)) {
            pacienteRepository.findByUsuarioEmail(usuario.getEmail())
                    .ifPresent(p -> claims.put("patientId", p.getId()));
        } else if ("DOCTOR".equals(rolNombre)) {
            medicoRepository.findByUsuarioEmail(usuario.getEmail())
                    .ifPresent(m -> claims.put("doctorId", m.getId()));
        }

        String token = jwtServicio.generarToken(usuario.getEmail(), claims);
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String encabezadoAutorizacion) {
        if (encabezadoAutorizacion == null || !encabezadoAutorizacion.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String token = encabezadoAutorizacion.substring(7);
        if (!jwtServicio.validarToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String jti = jwtServicio.obtenerJti(token);
        LocalDateTime expiraEn = jwtServicio.obtenerFechaExpiracion(token);

        if (jti == null || jti.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        tokenRevocadoService.revocar(jti, expiraEn);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/registro")
    @Transactional
    public ResponseEntity<String> registrar(@Valid @RequestBody RegisterRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new ConflictoException("El correo ya está registrado");
        }

        Rol rolPaciente = rolRepository.findByNombre("PATIENT")
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "El rol PATIENT no existe en la base de datos"));

        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setNombreCompleto(request.getNombreCompleto());
        nuevoUsuario.setEmail(request.getEmail());
        nuevoUsuario.setContrasena(passwordEncoder.encode(request.getPassword()));
        nuevoUsuario.setTelefono(request.getTelefono());
        nuevoUsuario.setRol(rolPaciente);
        nuevoUsuario.setActivo(true);

        Usuario guardado = usuarioRepository.save(nuevoUsuario);

        Paciente paciente = new Paciente();
        paciente.setUsuario(guardado);
        paciente.setActivo(true);
        pacienteRepository.save(paciente);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Usuario registrado exitosamente");
    }

    @PostMapping("/recuperar-contrasena")
    public ResponseEntity<?> solicitarRecuperacion(
            @Valid @RequestBody SolicitudRecuperacionRequest request) {

        tokenRecuperacionService.solicitarRecuperacion(request.getEmail());

        Map<String, String> respuesta = new HashMap<>();
        respuesta.put("mensaje", "Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña.");
        return ResponseEntity.ok(respuesta);
    }

    @PostMapping("/restablecer-contrasena")
    public ResponseEntity<?> restablecerContrasena(
            @Valid @RequestBody RestablecerContrasenaRequest request) {

        tokenRecuperacionService.restablecerContrasena(
                request.getToken(),
                request.getNuevaContrasena());

        Map<String, String> respuesta = new HashMap<>();
        respuesta.put("mensaje", "Tu contraseña ha sido restablecida correctamente.");
        return ResponseEntity.ok(respuesta);
    }

    @PostMapping("/recuperar-contrasena-sms")
    public ResponseEntity<?> solicitarRecuperacionSms(
            @Valid @RequestBody SolicitudRecuperacionRequest request) {

        tokenRecuperacionService.solicitarRecuperacionSms(request.getEmail());

        Map<String, String> respuesta = new HashMap<>();
        respuesta.put("mensaje", "Si el correo está registrado y tiene teléfono asociado, recibirás un código SMS.");
        return ResponseEntity.ok(respuesta);
    }

    @PostMapping("/restablecer-contrasena-sms")
    public ResponseEntity<?> restablecerContrasenaSms(
            @RequestBody Map<String, String> body) {

        String email = body.get("email");
        String codigo = body.get("codigo");
        String nuevaContrasena = body.get("nuevaContrasena");

        if (email == null || email.isBlank() || codigo == null || codigo.isBlank()
                || nuevaContrasena == null || nuevaContrasena.length() < 6) {
            Map<String, String> error = new HashMap<>();
            error.put("mensaje", "Debes enviar email, código SMS y una contraseña de al menos 6 caracteres.");
            return ResponseEntity.badRequest().body(error);
        }

        tokenRecuperacionService.restablecerContrasenaSms(email, codigo, nuevaContrasena);

        Map<String, String> respuesta = new HashMap<>();
        respuesta.put("mensaje", "Tu contraseña ha sido restablecida correctamente.");
        return ResponseEntity.ok(respuesta);
    }
}