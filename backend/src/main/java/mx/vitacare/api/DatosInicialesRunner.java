package mx.vitacare.api;

import mx.vitacare.api.model.Medico;
import mx.vitacare.api.model.Paciente;
import mx.vitacare.api.model.Rol;
import mx.vitacare.api.model.Usuario;
import mx.vitacare.api.repository.MedicoRepository;
import mx.vitacare.api.repository.PacienteRepository;
import mx.vitacare.api.repository.RolRepository;
import mx.vitacare.api.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DatosInicialesRunner implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PacienteRepository pacienteRepository;
    private final MedicoRepository medicoRepository; 
    private final PasswordEncoder passwordEncoder;

    public DatosInicialesRunner(UsuarioRepository usuarioRepository, 
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

    @Override
    public void run(String... args) throws Exception {
        if (usuarioRepository.count() > 0) {
            return;
        }

        System.out.println("⏳ Base de datos vacía. Insertando datos de prueba...");

        Rol rolAdmin = rolRepository.findByNombre("ADMIN").orElseThrow();
        Rol rolDoctor = rolRepository.findByNombre("DOCTOR").orElseThrow();
        Rol rolPaciente = rolRepository.findByNombre("PATIENT").orElseThrow();

        
        Usuario admin = new Usuario();
        admin.setNombreCompleto("Administrador VITACARE");
        admin.setEmail("admin@vitacare.com");
        admin.setContrasena(passwordEncoder.encode("Admin123!"));
        admin.setTelefono("5512345678");
        admin.setRol(rolAdmin);
        admin.setActivo(true);
        usuarioRepository.save(admin);

        
        for (int i = 1; i <= 3; i++) {
            Usuario doctorUser = new Usuario();
            doctorUser.setNombreCompleto("Dr. Prueba " + i);
            doctorUser.setEmail("doctor" + i + "@vitacare.com");
            doctorUser.setContrasena(passwordEncoder.encode("Doctor123!"));
            doctorUser.setTelefono("551234567" + i);
            doctorUser.setRol(rolDoctor);
            doctorUser.setActivo(true);
            usuarioRepository.save(doctorUser);

            Medico medico = new Medico();
            medico.setUsuario(doctorUser);
            medico.setCedulaProfesional("CEDULA-" + i);
            medico.setAnosExperiencia(i * 5);
            medico.setConsultorio("Consultorio " + i);
            medico.setActivo(true);
            medicoRepository.save(medico); 
        }

        
        for (int i = 1; i <= 10; i++) {
            Usuario pacienteUser = new Usuario();
            pacienteUser.setNombreCompleto("Paciente de Prueba " + i);
            pacienteUser.setEmail("paciente" + i + "@vitacare.com");
            pacienteUser.setContrasena(passwordEncoder.encode("Paciente123!"));
            pacienteUser.setTelefono("559876543" + i);
            pacienteUser.setRol(rolPaciente);
            pacienteUser.setActivo(true);
            usuarioRepository.save(pacienteUser);

            Paciente paciente = new Paciente();
            paciente.setUsuario(pacienteUser);
            paciente.setFechaNacimiento(LocalDate.of(1990 + i, 5, 15));
            paciente.setSexo(i % 2 == 0 ? "Masculino" : "Femenino");
            paciente.setTipoSangre("O+");
            paciente.setNss("123456789" + String.format("%02d", i));
            paciente.setActivo(true);
            pacienteRepository.save(paciente);
        }

        System.out.println("Datos de prueba insertados correctamente (1 Admin, 3 Doctores con perfil, 10 Pacientes).");
    }
}