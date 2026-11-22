package mx.vitacare.api.service;

import mx.vitacare.api.dto.PacienteRequestDTO;
import mx.vitacare.api.dto.PacienteResponseDTO;
import mx.vitacare.api.model.Paciente;
import mx.vitacare.api.model.Rol;
import mx.vitacare.api.model.Usuario;
import mx.vitacare.api.repository.PacienteRepository;
import mx.vitacare.api.repository.RolRepository;
import mx.vitacare.api.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PacienteService {

    private final PacienteRepository pacienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    public PacienteService(PacienteRepository pacienteRepository, UsuarioRepository usuarioRepository, RolRepository rolRepository, PasswordEncoder passwordEncoder) {
        this.pacienteRepository = pacienteRepository;
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Page<PacienteResponseDTO> listarPaginados(String search, Pageable pageable) {
        Page<Paciente> pagina = (search == null || search.isEmpty()) 
            ? pacienteRepository.findAll(pageable) 
            : pacienteRepository.buscarPorTexto(search, pageable);
        return pagina.map(this::convertirADto);
    }

    public PacienteResponseDTO crear(PacienteRequestDTO dto) {
        // 1. Verificar si el correo ya existe
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("El correo ya está registrado");
        }

        // 2. Buscar el rol PATIENT
        Rol rolPaciente = rolRepository.findByNombre("PATIENT").orElseThrow();

        // 3. Crear el Usuario
        Usuario user = new Usuario();
        user.setNombreCompleto(dto.getNombreCompleto());
        user.setEmail(dto.getEmail());
        user.setContrasena(passwordEncoder.encode("Paciente123!")); // Contraseña por defecto
        user.setTelefono(dto.getTelefono());
        user.setRol(rolPaciente);
        user.setActivo(true);
        usuarioRepository.save(user);

        // 4. Crear el Paciente
        Paciente paciente = new Paciente();
        paciente.setUsuario(user);
        mapearDatos(paciente, dto);
        paciente.setActivo(true);

        Paciente guardado = pacienteRepository.save(paciente);
        return convertirADto(guardado);
    }

    public PacienteResponseDTO actualizar(Long id, PacienteRequestDTO dto) {
        Paciente paciente = pacienteRepository.findById(id).orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
        
        // Actualizamos los datos del paciente
        mapearDatos(paciente, dto);

        // Actualizamos los datos del usuario asociado
        Usuario user = paciente.getUsuario();
        user.setNombreCompleto(dto.getNombreCompleto());
        user.setTelefono(dto.getTelefono());
        usuarioRepository.save(user);

        return convertirADto(pacienteRepository.save(paciente));
    }

    public void eliminar(Long id) {
        Paciente paciente = pacienteRepository.findById(id).orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
        paciente.setActivo(false); // Borrado lógico
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