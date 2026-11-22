package mx.vitacare.api.service;

import mx.vitacare.api.dto.PacienteRequestDTO;
import mx.vitacare.api.dto.PacienteResponseDTO;
import mx.vitacare.api.model.Paciente;
import mx.vitacare.api.model.Usuario;
import mx.vitacare.api.repository.PacienteRepository;
import mx.vitacare.api.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class PacienteService {

    private final PacienteRepository pacienteRepository;
    private final UsuarioRepository usuarioRepository;

    public PacienteService(PacienteRepository pacienteRepository, UsuarioRepository usuarioRepository) {
        this.pacienteRepository = pacienteRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public Page<PacienteResponseDTO> listarPaginados(String search, Pageable pageable) {
        Page<Paciente> pagina = (search == null || search.isEmpty()) 
            ? pacienteRepository.findAll(pageable) 
            : pacienteRepository.buscarPorTexto(search, pageable);
            
        return pagina.map(this::convertirADto);
    }

    public PacienteResponseDTO obtenerPorId(Long id) {
        Paciente paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
        return convertirADto(paciente);
    }

    public PacienteResponseDTO crear(PacienteRequestDTO dto) {
        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Paciente paciente = new Paciente();
        paciente.setUsuario(usuario);
        mapearDatos(paciente, dto);
        
        Paciente guardado = pacienteRepository.save(paciente);
        return convertirADto(guardado);
    }

    public PacienteResponseDTO actualizar(Long id, PacienteRequestDTO dto) {
        Paciente paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));

        mapearDatos(paciente, dto);
        
        Paciente actualizado = pacienteRepository.save(paciente);
        return convertirADto(actualizado);
    }

    public void eliminar(Long id) {
        Paciente paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
        // Borrado lógico
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