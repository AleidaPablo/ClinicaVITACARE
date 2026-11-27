package mx.vitacare.api.notificacion;


public record CitaNotificacionEvento(Long citaId, Tipo tipo) {

    public enum Tipo {
        CREADA,
        ESTADO_CAMBIADO
    }
}
