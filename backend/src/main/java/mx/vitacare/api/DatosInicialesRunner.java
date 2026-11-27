package mx.vitacare.api;

import mx.vitacare.api.model.Cita;
import mx.vitacare.api.model.Consulta;
import mx.vitacare.api.model.Expediente;
import mx.vitacare.api.model.Medico;
import mx.vitacare.api.model.Paciente;
import mx.vitacare.api.model.Rol;
import mx.vitacare.api.model.Usuario;
import mx.vitacare.api.repository.CitaRepository;
import mx.vitacare.api.repository.ConsultaRepository;
import mx.vitacare.api.repository.ExpedienteRepository;
import mx.vitacare.api.repository.MedicoRepository;
import mx.vitacare.api.repository.PacienteRepository;
import mx.vitacare.api.repository.RolRepository;
import mx.vitacare.api.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Component
public class DatosInicialesRunner implements CommandLineRunner {

    private static final String CONTRASENA_ADMIN = "Admin123!";
    private static final String CONTRASENA_MEDICO = "Doctor123!";
    private static final String CONTRASENA_PACIENTE = "Paciente123!";

    private record MedicoSemilla(String nombre, String email, String telefono, String especialidad,
                                 String cedula, int anosExperiencia, String consultorio,
                                 String disponibilidad, String idiomas) {
    }

    private record PacienteSemilla(String nombre, String email, String telefono, LocalDate nacimiento,
                                   String sexo, String sangre, String estadoCivil, String ocupacion,
                                   String direccion, String contactoNombre, String contactoTelefono,
                                   String seguro) {
    }

    private static final List<MedicoSemilla> MEDICOS = List.of(
            new MedicoSemilla("Dra. Mariana Hernández Cruz", "dra.mariana.hernandez@vitacare.com", "9511428390",
                    "Medicina General", "10456321", 12, "Consultorio 1", "Lunes a viernes, 9:00 a 15:00", "Español, Inglés"),
            new MedicoSemilla("Dr. Alejandro Ramírez Torres", "dr.alejandro.ramirez@vitacare.com", "9512084715",
                    "Cardiología", "9823417", 18, "Consultorio 2", "Lunes a jueves, 10:00 a 16:00", "Español, Inglés"),
            new MedicoSemilla("Dra. Sofía Martínez Aguilar", "dra.sofia.martinez@vitacare.com", "9513196402",
                    "Pediatría", "11234908", 9, "Consultorio 3", "Martes a sábado, 9:00 a 14:00", "Español"),
            new MedicoSemilla("Dr. Roberto Sánchez Vega", "dr.roberto.sanchez@vitacare.com", "9514279183",
                    "Dermatología", "8745216", 21, "Consultorio 4", "Lunes, miércoles y viernes, 11:00 a 18:00", "Español, Francés"),
            new MedicoSemilla("Dra. Valeria Gómez Luna", "dra.valeria.gomez@vitacare.com", "9515830247",
                    "Ginecología", "10987345", 14, "Consultorio 5", "Lunes a viernes, 12:00 a 18:00", "Español, Inglés"),
            new MedicoSemilla("Dr. Fernando Castro Mendoza", "dr.fernando.castro@vitacare.com", "9516401928",
                    "Neurología", "10567890", 16, "Consultorio 6", "Lunes a viernes, 8:00 a 14:00", "Español, Inglés"),
            new MedicoSemilla("Dra. Gabriela Domínguez Ríos", "dra.gabriela.dominguez@vitacare.com", "9511957364",
                    "Oftalmología", "11456789", 11, "Consultorio 7", "Martes a viernes, 10:00 a 17:00", "Español"),
            new MedicoSemilla("Dr. Eduardo Morales Chávez", "dr.eduardo.morales@vitacare.com", "9512748509",
                    "Traumatología", "9654321", 19, "Consultorio 8", "Lunes, miércoles y viernes, 9:00 a 16:00", "Español, Inglés"),
            new MedicoSemilla("Dra. Patricia Navarro Silva", "dra.patricia.navarro@vitacare.com", "9513684021",
                    "Endocrinología", "11876543", 8, "Consultorio 9", "Lunes a jueves, 11:00 a 17:00", "Español"),
            new MedicoSemilla("Dr. Arturo Vázquez Peña", "dr.arturo.vazquez@vitacare.com", "9514927156",
                    "Neumología", "10234567", 15, "Consultorio 10", "Martes a sábado, 9:00 a 15:00", "Español, Inglés")
    );

    private static final List<PacienteSemilla> PACIENTES = List.of(
            new PacienteSemilla("Ana Lucía Pérez Morales", "analucia.perez94@gmail.com", "9511284930",
                    LocalDate.of(1994, 3, 12), "Femenino", "O+", "Soltera", "Diseñadora gráfica",
                    "Col. Reforma, Oaxaca de Juárez, Oax.", "Rosa Morales (madre)", "9512348192", "IMSS"),
            new PacienteSemilla("Carlos Eduardo Jiménez Ruiz", "carlos.jimenez.ruiz@gmail.com", "9512476018",
                    LocalDate.of(1988, 7, 25), "Masculino", "A+", "Casado", "Ingeniero civil",
                    "Col. Volcanes, Oaxaca de Juárez, Oax.", "Patricia Ruiz (esposa)", "9513894720", "Privado"),
            new PacienteSemilla("Fernanda Guadalupe López Herrera", "fer.lopezherrera@gmail.com", "9513509284",
                    LocalDate.of(2001, 11, 2), "Femenino", "B+", "Soltera", "Estudiante",
                    "Col. Del Maestro, Oaxaca de Juárez, Oax.", "Guadalupe Herrera (madre)", "9511765409", "IMSS"),
            new PacienteSemilla("Jorge Luis Mendoza Castillo", "jorgeluis.mendoza75@gmail.com", "9514813627",
                    LocalDate.of(1975, 1, 30), "Masculino", "O-", "Casado", "Comerciante",
                    "Col. Centro, Oaxaca de Juárez, Oax.", "Elena Castillo (esposa)", "9512904815", "Ninguno"),
            new PacienteSemilla("Daniela Alejandra Vargas Núñez", "dani.vargas.nunez@gmail.com", "9515628491",
                    LocalDate.of(1990, 9, 18), "Femenino", "A-", "Casada", "Docente",
                    "Col. Estrella, Oaxaca de Juárez, Oax.", "Héctor Vargas (esposo)", "9514129038", "ISSSTE"),
            new PacienteSemilla("Miguel Ángel Rojas Fuentes", "miguelangel.rojas83@gmail.com", "9516194735",
                    LocalDate.of(1983, 5, 9), "Masculino", "AB+", "Divorciado", "Contador",
                    "Col. Jalatlaco, Oaxaca de Juárez, Oax.", "Teresa Fuentes (madre)", "9515382910", "Privado"),
            new PacienteSemilla("Paola Itzel Cruz Santiago", "paola.cruz.santiago@gmail.com", "9511837492",
                    LocalDate.of(1997, 12, 21), "Femenino", "O+", "Soltera", "Enfermera",
                    "Col. Santa Rosa, Santa Lucía del Camino, Oax.", "Itzel Santiago (madre)", "9516472019", "IMSS"),
            new PacienteSemilla("Luis Fernando Ortiz Bautista", "luisfer.ortiz04@gmail.com", "9512948160",
                    LocalDate.of(2004, 4, 14), "Masculino", "B-", "Soltero", "Estudiante",
                    "Col. Cinco Señores, Oaxaca de Juárez, Oax.", "Martha Bautista (madre)", "9511509384", "ISSSTE"),
            new PacienteSemilla("Karla Yesenia Morales Díaz", "karla.morales.diaz@gmail.com", "9513762049",
                    LocalDate.of(1986, 8, 3), "Femenino", "A+", "Casada", "Administradora",
                    "Fracc. Los Ángeles, Santa Cruz Xoxocotlán, Oax.", "Ramón Díaz (esposo)", "9512684713", "Privado"),
            new PacienteSemilla("Ricardo Alonso Gutiérrez Pérez", "ricardo.gutierrez69@gmail.com", "9514590382",
                    LocalDate.of(1969, 10, 27), "Masculino", "O+", "Casado", "Jubilado",
                    "Col. Reforma, Oaxaca de Juárez, Oax.", "Carmen Pérez (esposa)", "9513920471", "IMSS"),
            new PacienteSemilla("Esmeralda Cortés Ramos", "esme.cortes.ramos@gmail.com", "9515149276",
                    LocalDate.of(1999, 2, 16), "Femenino", "AB-", "Soltera", "Abogada",
                    "Col. Ex Marquesado, Oaxaca de Juárez, Oax.", "Luis Cortés (padre)", "9514873120", "Privado"),
            new PacienteSemilla("Héctor Manuel Aguilar Vásquez", "hector.aguilar.vasquez@gmail.com", "9516823941",
                    LocalDate.of(1992, 6, 5), "Masculino", "A+", "Soltero", "Chef",
                    "Col. Xochimilco, Oaxaca de Juárez, Oax.", "Julia Vásquez (madre)", "9515910284", "Ninguno")
    );

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PacienteRepository pacienteRepository;
    private final MedicoRepository medicoRepository;
    private final ExpedienteRepository expedienteRepository;
    private final CitaRepository citaRepository;
    private final ConsultaRepository consultaRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${seed.demo.telefono:}")
    private String telefonoDemo;

    @Value("${seed.demo.email:}")
    private String emailDemo;

    public DatosInicialesRunner(UsuarioRepository usuarioRepository,
                                RolRepository rolRepository,
                                PacienteRepository pacienteRepository,
                                MedicoRepository medicoRepository,
                                ExpedienteRepository expedienteRepository,
                                CitaRepository citaRepository,
                                ConsultaRepository consultaRepository,
                                PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.pacienteRepository = pacienteRepository;
        this.medicoRepository = medicoRepository;
        this.expedienteRepository = expedienteRepository;
        this.citaRepository = citaRepository;
        this.consultaRepository = consultaRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (usuarioRepository.count() > 0) {
            return;
        }

        System.out.println("Base de datos vacía. Insertando datos de prueba...");

        Rol rolAdmin = rolRepository.findByNombre("ADMIN").orElseThrow();
        Rol rolDoctor = rolRepository.findByNombre("DOCTOR").orElseThrow();
        Rol rolPaciente = rolRepository.findByNombre("PATIENT").orElseThrow();

        
        Usuario admin = new Usuario();
        admin.setNombreCompleto("Laura Beatriz Ortega Salinas");
        admin.setEmail("admin@vitacare.com");
        admin.setContrasena(passwordEncoder.encode(CONTRASENA_ADMIN));
        admin.setTelefono("9511047283");
        admin.setDepartamento("Dirección administrativa");
        admin.setRol(rolAdmin);
        admin.setActivo(true);
        usuarioRepository.save(admin);

       
        List<Medico> medicosGuardados = new ArrayList<>();
        for (MedicoSemilla m : MEDICOS) {
            Usuario usuarioMedico = new Usuario();
            usuarioMedico.setNombreCompleto(m.nombre());
            usuarioMedico.setEmail(m.email());
            usuarioMedico.setContrasena(passwordEncoder.encode(CONTRASENA_MEDICO));
            usuarioMedico.setTelefono(m.telefono());
            usuarioMedico.setDepartamento(m.especialidad());
            usuarioMedico.setRol(rolDoctor);
            usuarioMedico.setActivo(true);
            usuarioRepository.save(usuarioMedico);

            Medico medico = new Medico();
            medico.setUsuario(usuarioMedico);
            medico.setCedulaProfesional(m.cedula());
            medico.setAnosExperiencia(m.anosExperiencia());
            medico.setConsultorio(m.consultorio());
            medico.setDisponibilidad(m.disponibilidad());
            medico.setIdiomas(m.idiomas());
            medico.setActivo(true);
            medicosGuardados.add(medicoRepository.save(medico));
        }

        
        List<Paciente> pacientesGuardados = new ArrayList<>();
        List<Expediente> expedientesGuardados = new ArrayList<>();
        int numero = 0;
        for (PacienteSemilla p : PACIENTES) {
            numero++;
            boolean esPacienteDemo = numero == 1;

            Usuario usuarioPaciente = new Usuario();
            usuarioPaciente.setNombreCompleto(p.nombre());
            usuarioPaciente.setEmail(esPacienteDemo && !emailDemo.isBlank() ? emailDemo.trim() : p.email());
            usuarioPaciente.setContrasena(passwordEncoder.encode(CONTRASENA_PACIENTE));
            usuarioPaciente.setTelefono(esPacienteDemo && !telefonoDemo.isBlank() ? telefonoDemo.trim() : p.telefono());
            usuarioPaciente.setRol(rolPaciente);
            usuarioPaciente.setActivo(true);
            usuarioRepository.save(usuarioPaciente);

            Paciente paciente = new Paciente();
            paciente.setUsuario(usuarioPaciente);
            paciente.setFechaNacimiento(p.nacimiento());
            paciente.setSexo(p.sexo());
            paciente.setTipoSangre(p.sangre());
            paciente.setEstadoCivil(p.estadoCivil());
            paciente.setOcupacion(p.ocupacion());
            paciente.setDireccion(p.direccion());
            paciente.setContactoEmergenciaNombre(p.contactoNombre());
            paciente.setContactoEmergenciaTelefono(p.contactoTelefono());
            paciente.setTipoSeguro(p.seguro());
            paciente.setNss("751294" + String.format("%05d", numero));
            paciente.setActivo(true);
            Paciente pacienteGuardado = pacienteRepository.save(paciente);
            pacientesGuardados.add(pacienteGuardado);

            Expediente expediente = new Expediente();
            expediente.setPaciente(pacienteGuardado);
            expediente.setAntecedentesPersonales("Sin hospitalizaciones recientes.");
            expediente.setAlergias(numero % 3 == 0 ? "Penicilina" : "Ninguna conocida");
            expediente.setPadecimientosCronicos(numero % 4 == 0 ? "Hipertensión leve controlada" : "Ninguno");
            expediente.setMedicamentosUsoContinuo("Ninguno");
            expediente.setCirugiasPrevias(numero % 5 == 0 ? "Apendicectomía" : "Ninguna");
            expediente.setAntecedentesFamiliares("Diabetes tipo 2 en rama materna");
            expedientesGuardados.add(expedienteRepository.save(expediente));
        }

        
        String[] motivos = {
                "Revisión general anual", "Dolor de cabeza persistente", "Control de presión arterial",
                "Chequeo dermatológico", "Consulta de seguimiento", "Molestia muscular en hombro",
                "Valoración preventiva", "Revisión de estudios de laboratorio", "Alergia estacional",
                "Control metabólico", "Dolor lumbar leve", "Chequeo general"
        };

        LocalDateTime basePasada = LocalDateTime.now().minusDays(15).withHour(9).withMinute(0).withSecond(0).withNano(0);
        for (int i = 0; i < 12; i++) {
            Medico medico = medicosGuardados.get(i % medicosGuardados.size());
            Paciente paciente = pacientesGuardados.get(i);
            Expediente expediente = expedientesGuardados.get(i);

            boolean esCompletada = i < 10;
            LocalDateTime fechaCita = esCompletada
                    ? basePasada.plusDays(i).withHour(9 + (i % 7))
                    : LocalDateTime.now().plusDays(i - 8).withHour(10 + (i % 4)).withMinute(0).withSecond(0).withNano(0);

            Cita cita = new Cita();
            cita.setPaciente(paciente);
            cita.setMedico(medico);
            cita.setFechaHora(fechaCita);
            cita.setTipoConsulta(i % 2 == 0 ? "Consulta general" : "Seguimiento");
            cita.setMotivo(motivos[i]);
            cita.setDuracion(30);
            cita.setModalidad("Presencial");
            cita.setUbicacion(medico.getConsultorio());
            cita.setEstado(esCompletada ? "COMPLETADA" : (i == 10 ? "CONFIRMADA" : "PENDIENTE"));
            Cita citaGuardada = citaRepository.save(cita);

            
            if (esCompletada) {
                Consulta consulta = new Consulta();
                consulta.setExpediente(expediente);
                consulta.setMedico(medico);
                consulta.setCita(citaGuardada);
                consulta.setFechaConsulta(fechaCita.toLocalDate());
                consulta.setMotivoConsulta(motivos[i]);
                consulta.setDiagnostico("Paciente estable, evolución favorable.");
                consulta.setTratamiento("Hidratación adecuada, reposo relativo y seguimiento en 30 días.");
                consulta.setProximaRevision(fechaCita.toLocalDate().plusDays(30));
                consulta.setObservaciones("Signos vitales dentro de parámetros normales.");
                consulta.setPresionArterial("120/80");
                consulta.setPulso(72 + (i % 10));
                consulta.setTemperatura(new BigDecimal("36.60"));
                consulta.setPeso(new BigDecimal("68.50"));
                consulta.setEstatura(new BigDecimal("1.68"));
                consultaRepository.save(consulta);
            }
        }

        System.out.println("Datos de prueba insertados: 1 administrador, " + medicosGuardados.size()
                + " médicos, " + pacientesGuardados.size() + " pacientes, 12 citas y 10 consultas.");
    }
}