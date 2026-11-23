package mx.vitacare.api.notificacion;

/**
 * Evento que CitaService publica cuando una cita se crea o cambia de estado.
 * Se atiende hasta que la transacción termina con éxito (AFTER_COMMIT),
 * así nunca se avisa al paciente de una cita que se canceló por un error.
 */
public record CitaNotificacionEvento(Long citaId, Tipo tipo) {

    public enum Tipo {
        CREADA,
        ESTADO_CAMBIADO
    }
}
