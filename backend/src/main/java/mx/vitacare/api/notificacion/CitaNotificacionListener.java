package mx.vitacare.api.notificacion;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class CitaNotificacionListener {

    private final NotificacionService notificacionService;

    public CitaNotificacionListener(NotificacionService notificacionService) {
        this.notificacionService = notificacionService;
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void alCambiarCita(CitaNotificacionEvento evento) {
        notificacionService.notificarCita(evento.citaId(), evento.tipo());
    }
}
