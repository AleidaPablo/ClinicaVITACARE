package mx.vitacare.api.service;

import mx.vitacare.api.dto.PacienteRequestDTO;
import mx.vitacare.api.dto.PacienteResponseDTO;
import mx.vitacare.api.model.Paciente;
import mx.vitacare.api.model.Rol;
import mx.vitacare.api.model.Usuario;
import mx.vitacare.api.repository.PacienteRepository;
import mx.vitacare.api.repository.RolRepository;
import mx.vitacare.api.repository.UsuarioRepository;
import mx.vitacare.api.repository.CitaRepository;
import mx.vitacare.api.repository.MedicoRepository;
import mx.vitacare.api.exception.ConflictoException;
import mx.vitacare.api.exception.RecursoNoEncontradoException;
import mx.vitacare.api.exception.ReglaNegocioException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PacienteService {

    private final PacienteRepository pacienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final MedicoRepository medicoRepository;
    private final CitaRepository citaRepository;

    public PacienteService(
            PacienteRepository pacienteRepository,
            UsuarioRepository usuarioRepository,
            RolRepository rolRepository,
            PasswordEncoder passwordEncoder,
            MedicoRepository medicoRepository,
            CitaRepository citaRepository) {
        this.pacienteRepository = pacienteRepository;
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
        this.medicoRepository = medicoRepository;
        this.citaRepository = citaRepository;
    }

    @Transactional(readOnly = true)
    public Page<PacienteResponseDTO> listarPaginados(
            String search,
            Pageable pageable,
            String correoUsuario,
            String rol) {
        Page<Paciente> pagina;
        if ("PATIENT".equals(rol)) {
            Paciente paciente = pacienteRepository.findByUsuarioEmail(correoUsuario)
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "No se encontró el perfil de paciente."));
            pagina = pageable.getPageNumber() == 0
                    ? new PageImpl<>(List.of(paciente), pageable, 1)
                    : Page.empty(pageable);
        } else if ("DOCTOR".equals(rol)) {
            Long medicoId = medicoRepository.findByUsuarioEmail(correoUsuario)
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "No se encontró el perfil médico."))
                    .getId();
            pagina = pacienteRepository.buscarPorMedicoYTexto(medicoId, search, pageable);
        } else if ("ADMIN".equals(rol)) {
            pagina = (search == null || search.isEmpty())
                    ? pacienteRepository.findAll(pageable)
                    : pacienteRepository.buscarPorTexto(search, pageable);
        } else {
            throw new AccessDeniedException("El rol no tiene acceso a los pacientes.");
        }
        return pagina.map(this::convertirADto);
    }

    @Transactional
    public PacienteResponseDTO crear(PacienteRequestDTO dto) {
        if (dto.getPassword() == null || dto.getPassword().isBlank()) {
            throw new ReglaNegocioException("La contraseña es obligatoria al crear un paciente");
        }
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new ConflictoException("El correo ya está registrado");
        }

        Rol rolPaciente = rolRepository.findByNombre("PATIENT")
                .orElseThrow(() -> new RecursoNoEncontradoException("El rol PATIENT no existe"));

        Usuario user = new Usuario();
        user.setNombreCompleto(dto.getNombreCompleto());
        user.setEmail(dto.getEmail());
        user.setContrasena(passwordEncoder.encode(dto.getPassword()));
        user.setTelefono(dto.getTelefono());
        user.setRol(rolPaciente);
        user.setActivo(true);
        usuarioRepository.save(user);

        Paciente paciente = new Paciente();
        paciente.setUsuario(user);
        mapearDatos(paciente, dto);
        paciente.setActivo(true);

        Paciente guardado = pacienteRepository.save(paciente);
        return convertirADto(guardado);
    }

    @Transactional
    public PacienteResponseDTO actualizar(Long id, PacienteRequestDTO dto) {
        Paciente paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Paciente no encontrado"));

        mapearDatos(paciente, dto);

        Usuario user = paciente.getUsuario();
        user.setNombreCompleto(dto.getNombreCompleto());
        user.setTelefono(dto.getTelefono());
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            user.setContrasena(passwordEncoder.encode(dto.getPassword()));
        }
        usuarioRepository.save(user);

        return convertirADto(pacienteRepository.save(paciente));
    }

    @Transactional(readOnly = true)
    public PacienteResponseDTO obtenerPorId(Long id, String correoUsuario, String rol) {
        Paciente paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Paciente no encontrado"));

        if ("PATIENT".equals(rol)) {
            Paciente propio = pacienteRepository.findByUsuarioEmail(correoUsuario)
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "No se encontró el perfil de paciente asociado."));
            if (!propio.getId().equals(id)) {
                throw new AccessDeniedException("Solo puedes consultar tu propio perfil.");
            }
        } else if ("DOCTOR".equals(rol)) {
            Long medicoId = medicoRepository.findByUsuarioEmail(correoUsuario)
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "No se encontró el perfil médico asociado."))
                    .getId();
            if (!citaRepository.existsByPacienteIdAndMedicoId(id, medicoId)) {
                throw new AccessDeniedException(
                        "No tienes una cita asignada con este paciente.");
            }
        } else if (!"ADMIN".equals(rol)) {
            throw new AccessDeniedException("El rol no tiene acceso a este paciente.");
        }

        return convertirADto(paciente);
    }

    @Transactional
    public void eliminar(Long id) {
        Paciente paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Paciente no encontrado"));
        paciente.setActivo(false); 
        pacienteRepository.save(paciente);
    }

    private void mapearDatos(Paciente paciente, PacienteRequestDTO dto) {
        paciente.setFechaNacimiento(dto.getFechaNacimiento());
        paciente.setSexo(dto.getSexo());
        paciente.setEstadoCivil(dto.getEstadoCivil());
        paciente.setOcupacion(dto.getOcupacion());
        paciente.setDireccion(dto.getDireccion());
        paciente.setTipoSangre(dto.getTipoSangre());
        paciente.setContactoEmergenciaNombre(dto.getContactoEmergenciaNombre());
        paciente.setContactoEmergenciaTelefono(dto.getContactoEmergenciaTelefono());
        paciente.setTipoSeguro(dto.getTipoSeguro());
        paciente.setNss(dto.getNss());
    }

    private PacienteResponseDTO convertirADto(Paciente paciente) {
        return new PacienteResponseDTO(
                paciente.getId(),
                paciente.getUsuario().getNombreCompleto(),
                paciente.getUsuario().getEmail(),
                paciente.getUsuario().getTelefono(),
                paciente.getFechaNacimiento(),
                paciente.getSexo(),
                paciente.getEstadoCivil(),
                paciente.getOcupacion(),
                paciente.getDireccion(),
                paciente.getTipoSangre(),
                paciente.getContactoEmergenciaNombre(),
                paciente.getContactoEmergenciaTelefono(),
                paciente.getTipoSeguro(),
                paciente.getNss(),
                paciente.getActivo()
        );
    }

}