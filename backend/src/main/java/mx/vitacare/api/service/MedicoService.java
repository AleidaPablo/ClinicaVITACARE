package mx.vitacare.api.service;

import mx.vitacare.api.dto.MedicoRequestDTO;
import mx.vitacare.api.dto.MedicoResponseDTO;
import mx.vitacare.api.dto.DirectorioMedicoDTO;
import mx.vitacare.api.model.Medico;
import mx.vitacare.api.model.Rol;
import mx.vitacare.api.model.Usuario;
import mx.vitacare.api.repository.MedicoRepository;
import mx.vitacare.api.repository.RolRepository;
import mx.vitacare.api.repository.UsuarioRepository;
import mx.vitacare.api.exception.ConflictoException;
import mx.vitacare.api.exception.RecursoNoEncontradoException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

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

    public List<DirectorioMedicoDTO> listarDirectorioActivo() {
        return medicoRepository.listarDirectorioActivo().stream()
                .map(fila -> new DirectorioMedicoDTO(
                        ((Number) fila[0]).longValue(),
                        (String) fila[1],
                        (String) fila[2],
                        (String) fila[3]))
                .toList();
    }

    public MedicoResponseDTO crear(MedicoRequestDTO dto) {
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new ConflictoException("El correo ya está registrado");
        }

        Rol rolDoctor = rolRepository.findByNombre("DOCTOR")
                .orElseThrow(() -> new RecursoNoEncontradoException("El rol DOCTOR no existe"));

        Usuario user = new Usuario();
        user.setNombreCompleto(dto.getNombreCompleto());
        user.setEmail(dto.getEmail());
        user.setContrasena(passwordEncoder.encode(dto.getPassword()));
        user.setTelefono(dto.getTelefono());
        user.setRol(rolDoctor);
        user.setActivo(true);
        usuarioRepository.save(user);

       
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
        Medico medico = medicoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Médico no encontrado"));
        
        
        medico.setCedulaProfesional(dto.getCedulaProfesional());
        medico.setAnosExperiencia(dto.getAnosExperiencia());
        medico.setConsultorio(dto.getConsultorio());
        medico.setIdiomas(dto.getIdiomas());
        medico.setDisponibilidad(dto.getDisponibilidad());

        
        Usuario user = medico.getUsuario();
        user.setNombreCompleto(dto.getNombreCompleto());
        user.setTelefono(dto.getTelefono());
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            user.setContrasena(passwordEncoder.encode(dto.getPassword()));
        }
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