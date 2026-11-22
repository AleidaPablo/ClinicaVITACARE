package mx.vitacare.api.service;

import mx.vitacare.api.dto.MedicoRequestDTO;
import mx.vitacare.api.dto.MedicoResponseDTO;
import mx.vitacare.api.model.Medico;
import mx.vitacare.api.model.Rol;
import mx.vitacare.api.model.Usuario;
import mx.vitacare.api.repository.MedicoRepository;
import mx.vitacare.api.repository.RolRepository;
import mx.vitacare.api.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class MedicoService {

    private final MedicoRepository medicoRepository;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    public MedicoService(MedicoRepository medicoRepository, UsuarioRepository usuarioRepository, RolRepository rolRepository, PasswordEncoder passwordEncoder) {
        this.medicoRepository = medicoRepository;
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Page<MedicoResponseDTO> listar(Pageable pageable) {
        return medicoRepository.findAll(pageable).map(this::convertirADto);
    }

    public MedicoResponseDTO crear(MedicoRequestDTO dto) {
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("El correo ya está registrado");
        }

        Rol rolDoctor = rolRepository.findByNombre("DOCTOR").orElseThrow();

        // 1. Creamos el Usuario
        Usuario user = new Usuario();
        user.setNombreCompleto(dto.getNombreCompleto());
        user.setEmail(dto.getEmail());
        user.setContrasena(passwordEncoder.encode(dto.getPassword()));
        user.setTelefono(dto.getTelefono());
        user.setRol(rolDoctor);
        user.setActivo(true);
        usuarioRepository.save(user);

        // 2. Creamos el Medico
        Medico medico = new Medico();
        medico.setUsuario(user);
        medico.setCedulaProfesional(dto.getCedulaProfesional());
        medico.setAnosExperiencia(dto.getAnosExperiencia());
        medico.setConsultorio(dto.getConsultorio());
        medico.setIdiomas(dto.getIdiomas());
        medico.setDisponibilidad(dto.getDisponibilidad());
        medico.setActivo(true);

        Medico guardado = medicoRepository.save(medico);
        return convertirADto(guardado);
    }

    public MedicoResponseDTO actualizar(Long id, MedicoRequestDTO dto) {
        Medico medico = medicoRepository.findById(id).orElseThrow(() -> new RuntimeException("Médico no encontrado"));
        
        // Actualizamos sus datos de médico
        medico.setCedulaProfesional(dto.getCedulaProfesional());
        medico.setAnosExperiencia(dto.getAnosExperiencia());
        medico.setConsultorio(dto.getConsultorio());
        medico.setIdiomas(dto.getIdiomas());
        medico.setDisponibilidad(dto.getDisponibilidad());

        // Actualizamos sus datos de usuario
        Usuario user = medico.getUsuario();
        user.setNombreCompleto(dto.getNombreCompleto());
        user.setTelefono(dto.getTelefono());
        usuarioRepository.save(user);

        return convertirADto(medicoRepository.save(medico));
    }

    private MedicoResponseDTO convertirADto(Medico m) {
        return new MedicoResponseDTO(
            m.getId(),
            m.getUsuario().getNombreCompleto(),
            m.getUsuario().getEmail(),
            m.getUsuario().getTelefono(),
            m.getCedulaProfesional(),
            m.getAnosExperiencia(),
            m.getConsultorio(),
            m.getIdiomas(),
            m.getDisponibilidad(),
            m.getActivo()
        );
    }
}