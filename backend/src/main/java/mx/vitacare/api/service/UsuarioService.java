package mx.vitacare.api.service;

import mx.vitacare.api.dto.PerfilRequestDTO;
import mx.vitacare.api.dto.PerfilResponseDTO;
import mx.vitacare.api.dto.UsuarioRequestDTO;
import mx.vitacare.api.dto.UsuarioResponseDTO;
import mx.vitacare.api.exception.ConflictoException;
import mx.vitacare.api.exception.RecursoNoEncontradoException;
import mx.vitacare.api.exception.ReglaNegocioException;
import mx.vitacare.api.model.Medico;
import mx.vitacare.api.model.Paciente;
import mx.vitacare.api.model.Rol;
import mx.vitacare.api.model.Usuario;
import mx.vitacare.api.repository.MedicoRepository;
import mx.vitacare.api.repository.PacienteRepository;
import mx.vitacare.api.repository.RolRepository;
import mx.vitacare.api.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PacienteRepository pacienteRepository;
    private final MedicoRepository medicoRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          RolRepository rolRepository,
                          PacienteRepository pacienteRepository,
                          MedicoRepository medicoRepository,
                          PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.pacienteRepository = pacienteRepository;
        this.medicoRepository = medicoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public Page<UsuarioResponseDTO> listar(String search, String rol, Pageable pageable) {
        return usuarioRepository.buscarUsuarios(search, rol, pageable).map(this::convertirADto);
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO obtenerPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con ID: " + id));
        return convertirADto(usuario);
    }

    @Transactional
    public UsuarioResponseDTO crear(UsuarioRequestDTO dto) {
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new ConflictoException("El correo ya se encuentra registrado: " + dto.getEmail());
        }
        if (dto.getPassword() == null || dto.getPassword().isBlank()) {
            throw new ReglaNegocioException("La contraseña es obligatoria al crear una cuenta");
        }

        Rol rol = rolRepository.findByNombre(dto.getRol().toUpperCase())
                .orElseThrow(() -> new RecursoNoEncontradoException("Rol no encontrado: " + dto.getRol()));

        Usuario usuario = new Usuario();
        usuario.setNombreCompleto(dto.getNombreCompleto());
        usuario.setEmail(dto.getEmail());
        usuario.setContrasena(passwordEncoder.encode(dto.getPassword()));
        usuario.setTelefono(dto.getTelefono());
        usuario.setDepartamento(dto.getDepartamento());
        usuario.setRol(rol);
        usuario.setActivo(dto.getActivo() != null ? dto.getActivo() : true);

        Usuario guardado = usuarioRepository.save(usuario);

       
        if ("DOCTOR".equalsIgnoreCase(rol.getNombre())) {
            Medico medico = new Medico();
            medico.setUsuario(guardado);
            medico.setCedulaProfesional("PEND-" + guardado.getId());
            medico.setActivo(true);
            medicoRepository.save(medico);
        } else if ("PATIENT".equalsIgnoreCase(rol.getNombre())) {
            Paciente paciente = new Paciente();
            paciente.setUsuario(guardado);
            paciente.setActivo(true);
            pacienteRepository.save(paciente);
        }

        return convertirADto(guardado);
    }

    @Transactional
    public UsuarioResponseDTO actualizar(Long id, UsuarioRequestDTO dto, Authentication autenticacion) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con ID: " + id));

        Rol nuevoRol = null;
        if (dto.getRol() != null && !dto.getRol().isBlank()
                && !usuario.getRol().getNombre().equalsIgnoreCase(dto.getRol().trim())) {
            boolean esAdmin = autenticacion != null && autenticacion.getAuthorities().stream()
                    .anyMatch(autoridad -> "ROLE_ADMIN".equals(autoridad.getAuthority()));
            if (!esAdmin) {
                throw new AccessDeniedException("No tienes permiso para modificar roles");
            }
            if (usuario.getEmail().equalsIgnoreCase(autenticacion.getName())) {
                throw new AccessDeniedException("No puedes modificar tu propio rol");
            }
            nuevoRol = rolRepository.findByNombre(dto.getRol().trim().toUpperCase())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Rol no encontrado: " + dto.getRol()));
        }

        if (!usuario.getEmail().equalsIgnoreCase(dto.getEmail()) && usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new ConflictoException("El correo ya está en uso por otro usuario: " + dto.getEmail());
        }

        usuario.setNombreCompleto(dto.getNombreCompleto());
        usuario.setEmail(dto.getEmail());
        usuario.setTelefono(dto.getTelefono());
        usuario.setDepartamento(dto.getDepartamento());

        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            usuario.setContrasena(passwordEncoder.encode(dto.getPassword()));
        }

        if (nuevoRol != null) {
            usuario.setRol(nuevoRol);
            if ("DOCTOR".equalsIgnoreCase(nuevoRol.getNombre())
                    && medicoRepository.findByUsuarioId(usuario.getId()).isEmpty()) {
                Medico medico = new Medico();
                medico.setUsuario(usuario);
                medico.setCedulaProfesional("PEND-" + usuario.getId());
                medico.setActivo(true);
                medicoRepository.save(medico);
            } else if ("PATIENT".equalsIgnoreCase(nuevoRol.getNombre())
                    && pacienteRepository.findByUsuarioId(usuario.getId()).isEmpty()) {
                Paciente paciente = new Paciente();
                paciente.setUsuario(usuario);
                paciente.setActivo(true);
                pacienteRepository.save(paciente);
            }
        }

        if (dto.getActivo() != null) {
            usuario.setActivo(dto.getActivo());
        }

        return convertirADto(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioResponseDTO cambiarEstado(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con ID: " + id));
        usuario.setActivo(!usuario.getActivo());
        return convertirADto(usuarioRepository.save(usuario));
    }

    @Transactional(readOnly = true)
    public PerfilResponseDTO obtenerMiPerfil(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado: " + email));

        Optional<Paciente> pacienteOpt = pacienteRepository.findByUsuarioEmail(email);
        Optional<Medico> medicoOpt = medicoRepository.findByUsuarioEmail(email);

        return new PerfilResponseDTO(
                usuario.getId(),
                usuario.getNombreCompleto(),
                usuario.getEmail(),
                usuario.getTelefono(),
                usuario.getDepartamento(),
                usuario.getFotoUrl(),
                usuario.getRol().getNombre(),

                pacienteOpt.map(Paciente::getId).orElse(null),
                pacienteOpt.map(Paciente::getFechaNacimiento).orElse(null),
                pacienteOpt.map(Paciente::getSexo).orElse(null),
                pacienteOpt.map(Paciente::getEstadoCivil).orElse(null),
                pacienteOpt.map(Paciente::getOcupacion).orElse(null),
                pacienteOpt.map(Paciente::getDireccion).orElse(null),
                pacienteOpt.map(Paciente::getTipoSangre).orElse(null),
                pacienteOpt.map(Paciente::getContactoEmergenciaNombre).orElse(null),
                pacienteOpt.map(Paciente::getContactoEmergenciaTelefono).orElse(null),
                pacienteOpt.map(Paciente::getTipoSeguro).orElse(null),
                pacienteOpt.map(Paciente::getNss).orElse(null),

                medicoOpt.map(Medico::getId).orElse(null),
                medicoOpt.map(Medico::getCedulaProfesional).orElse(null),
                medicoOpt.map(Medico::getAnosExperiencia).orElse(null),
                medicoOpt.map(Medico::getConsultorio).orElse(null),
                medicoOpt.map(Medico::getIdiomas).orElse(null),
                medicoOpt.map(Medico::getDisponibilidad).orElse(null),
                "Medicina General"
        );
    }

    @Transactional
    public PerfilResponseDTO actualizarMiPerfil(String email, PerfilRequestDTO dto) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado: " + email));

        usuario.setNombreCompleto(dto.getNombreCompleto());
        if (dto.getTelefono() != null) usuario.setTelefono(dto.getTelefono());
        if (dto.getDepartamento() != null) usuario.setDepartamento(dto.getDepartamento());
        if (dto.getFotoUrl() != null) usuario.setFotoUrl(dto.getFotoUrl());
        usuarioRepository.save(usuario);

        Optional<Paciente> pacienteOpt = pacienteRepository.findByUsuarioEmail(email);
        if (pacienteOpt.isPresent()) {
            Paciente p = pacienteOpt.get();
            if (dto.getFechaNacimiento() != null) p.setFechaNacimiento(dto.getFechaNacimiento());
            if (dto.getSexo() != null) p.setSexo(dto.getSexo());
            if (dto.getEstadoCivil() != null) p.setEstadoCivil(dto.getEstadoCivil());
            if (dto.getOcupacion() != null) p.setOcupacion(dto.getOcupacion());
            if (dto.getDireccion() != null) p.setDireccion(dto.getDireccion());
            if (dto.getContactoEmergenciaNombre() != null) p.setContactoEmergenciaNombre(dto.getContactoEmergenciaNombre());
            if (dto.getContactoEmergenciaTelefono() != null) p.setContactoEmergenciaTelefono(dto.getContactoEmergenciaTelefono());
            pacienteRepository.save(p);
        }

        return obtenerMiPerfil(email);
    }

    private UsuarioResponseDTO convertirADto(Usuario u) {
        return new UsuarioResponseDTO(
                u.getId(),
                u.getNombreCompleto(),
                u.getEmail(),
                u.getTelefono(),
                u.getDepartamento(),
                u.getFotoUrl(),
                u.getRol() != null ? u.getRol().getNombre() : "PATIENT",
                u.getActivo(),
                u.getUltimoAcceso(),
                u.getCreadoEn()
        );
    }
}
