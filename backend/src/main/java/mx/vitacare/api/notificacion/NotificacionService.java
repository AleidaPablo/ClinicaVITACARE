package mx.vitacare.api.notificacion;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import mx.vitacare.api.model.Cita;
import mx.vitacare.api.model.Usuario;
import mx.vitacare.api.repository.CitaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;


@Service
public class NotificacionService {

    private static final Logger log = LoggerFactory.getLogger(NotificacionService.class);
    private static final DateTimeFormatter FORMATO_FECHA =
            DateTimeFormatter.ofPattern("EEEE d 'de' MMMM 'de' yyyy, HH:mm 'h'", Locale.of("es", "MX"));

    @FunctionalInterface
    private interface Envio {
        
        String enviar() throws Exception;
    }

    private final NotificacionRepository notificacionRepository;
    private final CitaRepository citaRepository;
    private final ObjectProvider<JavaMailSender> correo;

    @Value("${notificaciones.habilitadas:true}")
    private boolean habilitadas;

    @Value("${notificaciones.correo.remitente:no-reply@vitacare.local}")
    private String remitente;

    @Value("${notificaciones.prefijo-telefono:+52}")
    private String prefijoSms;

    @Value("${notificaciones.prefijo-whatsapp:+52}")
    private String prefijoWhatsapp;

    @Value("${twilio.account-sid:}")
    private String twilioSid;

    @Value("${twilio.auth-token:}")
    private String twilioToken;

    @Value("${twilio.numero-sms:}")
    private String numeroSms;

    @Value("${twilio.numero-whatsapp:whatsapp:+14155238886}")
    private String numeroWhatsapp;
    @Value("${notificaciones.sms.habilitado:true}")
    private boolean smsHabilitado;

    private boolean twilioListo = false;

    public NotificacionService(NotificacionRepository notificacionRepository,
                               CitaRepository citaRepository,
                               ObjectProvider<JavaMailSender> correo) {
        this.notificacionRepository = notificacionRepository;
        this.citaRepository = citaRepository;
        this.correo = correo;
    }

    @PostConstruct
    void iniciarTwilio() {
        if (!twilioSid.isBlank() && !twilioToken.isBlank()) {
            Twilio.init(twilioSid, twilioToken);
            twilioListo = true;
        } else {
            log.warn("Twilio sin configurar (twilio.account-sid / twilio.auth-token): "
                    + "los SMS y WhatsApp se registrarán como FALLIDO.");
        }
    }

    public void notificarCita(Long citaId, CitaNotificacionEvento.Tipo tipo) {
        if (!habilitadas) {
            return;
        }
        try {
            Cita cita = citaRepository.findById(citaId).orElse(null);
            if (cita == null) {
                return;
            }
            Usuario paciente = cita.getPaciente().getUsuario();
            String medico = cita.getMedico().getUsuario().getNombreCompleto();
            String fecha = cita.getFechaHora().format(FORMATO_FECHA);

            String asunto;
            String texto;
            if (tipo == CitaNotificacionEvento.Tipo.CREADA) {
                asunto = "VITACARE: tu cita quedó registrada";
                texto = "Hola " + paciente.getNombreCompleto() + ", tu cita de "
                        + cita.getTipoConsulta() + " con " + medico + " quedó registrada para el "
                        + fecha + ". Estado: " + cita.getEstado() + ".";
            } else {
                asunto = "VITACARE: actualización de tu cita";
                texto = "Hola " + paciente.getNombreCompleto() + ", tu cita del " + fecha
                        + " con " + medico + " ahora está " + cita.getEstado() + ".";
            }

            enviarCorreo(paciente, asunto, texto, citaId);
            if (smsHabilitado) {
                 enviarSms(paciente, texto, citaId);
            }
            enviarWhatsapp(paciente, texto, citaId);
        } catch (Exception ex) {
            log.error("No se pudieron generar las notificaciones de la cita {}", citaId, ex);
        }
    }

  
    public void enviarCorreo(Usuario usuario, String asunto, String mensaje, Long citaId) {
        if (usuario.getEmail() == null || usuario.getEmail().isBlank()) {
            return;
        }
        Notificacion n = nueva(usuario, citaId, CanalNotificacion.EMAIL, usuario.getEmail(), asunto, mensaje);
        despachar(n, () -> {
            JavaMailSender emisor = correo.getIfAvailable();
            if (emisor == null) {
                throw new IllegalStateException("Correo sin configurar: define spring.mail.host");
            }
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setFrom(remitente);
            mail.setTo(usuario.getEmail());
            mail.setSubject(asunto);
            mail.setText(mensaje);
            emisor.send(mail);
            return null;
        });
    }

    public void enviarSms(Usuario usuario, String mensaje, Long citaId) {
        if (usuario.getTelefono() == null || usuario.getTelefono().isBlank()) {
            return;
        }
        String destino = aE164(usuario.getTelefono(), prefijoSms);
        Notificacion n = nueva(usuario, citaId, CanalNotificacion.SMS, destino, null, mensaje);
        despachar(n, () -> {
            exigirTwilio(numeroSms, "twilio.numero-sms");
            return Message.creator(new PhoneNumber(destino), new PhoneNumber(numeroSms), mensaje)
                    .create().getSid();
        });
    }

    public void enviarWhatsapp(Usuario usuario, String mensaje, Long citaId) {
        if (usuario.getTelefono() == null || usuario.getTelefono().isBlank()) {
            return;
        }
        String destino = "whatsapp:" + aE164(usuario.getTelefono(), prefijoWhatsapp);
        Notificacion n = nueva(usuario, citaId, CanalNotificacion.WHATSAPP, destino, null, mensaje);
        despachar(n, () -> {
            exigirTwilio(numeroWhatsapp, "twilio.numero-whatsapp");
            String origen = numeroWhatsapp.startsWith("whatsapp:") ? numeroWhatsapp : "whatsapp:" + numeroWhatsapp;
            return Message.creator(new PhoneNumber(destino), new PhoneNumber(origen), mensaje)
                    .create().getSid();
        });
    }


    private void exigirTwilio(String numero, String propiedad) {
        if (!twilioListo || numero == null || numero.isBlank()) {
            throw new IllegalStateException("Twilio sin configurar: revisa twilio.account-sid, "
                    + "twilio.auth-token y " + propiedad);
        }
    }

    private Notificacion nueva(Usuario usuario, Long citaId, CanalNotificacion canal,
                               String destino, String asunto, String mensaje) {
        Notificacion n = new Notificacion();
        n.setUsuarioId(usuario.getId());
        n.setCitaId(citaId);
        n.setCanal(canal.name());
        n.setDestino(destino);
        n.setAsunto(asunto);
        n.setMensaje(mensaje);
        return n;
    }

    
    private void despachar(Notificacion n, Envio envio) {
        notificacionRepository.save(n);
        try {
            n.setProveedorId(envio.enviar());
            n.setEstado("ENVIADO");
            n.setEnviadoEn(LocalDateTime.now());
        } catch (Exception ex) {
            n.setEstado("FALLIDO");
            n.setError(recortar(ex.getMessage() != null ? ex.getMessage() : ex.getClass().getSimpleName(), 500));
            log.warn("Falló el envío por {} a {}: {}", n.getCanal(), n.getDestino(), n.getError());
        }
        notificacionRepository.save(n);
    }

    private String aE164(String telefono, String prefijo) {
        String limpio = telefono.replaceAll("[^0-9+]", "");
        return limpio.startsWith("+") ? limpio : prefijo + limpio;
    }

    private String recortar(String texto, int max) {
        return texto.length() <= max ? texto : texto.substring(0, max);
    }
}