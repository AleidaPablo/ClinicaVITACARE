package mx.vitacare.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Activa @Async para que los envíos de correo, SMS y WhatsApp
 * no hagan esperar la respuesta HTTP al usuario.
 */
@Configuration
@EnableAsync
public class AsyncConfig {
}
