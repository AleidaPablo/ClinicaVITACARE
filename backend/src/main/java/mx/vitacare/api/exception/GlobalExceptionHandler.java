package mx.vitacare.api.exception;

import jakarta.servlet.http.HttpServletRequest;
import mx.vitacare.api.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private static ResponseEntity<ErrorResponse> responder(HttpStatus estado, String mensaje, HttpServletRequest request) {
        ErrorResponse error = new ErrorResponse(estado.value(), estado.getReasonPhrase(), mensaje, request.getRequestURI());
        return new ResponseEntity<>(error, estado);
    }

    // 1. Errores de validación de los DTOs (@Valid): { "campo": "mensaje" }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errores.put(error.getField(), error.getDefaultMessage());
        }
        return new ResponseEntity<>(errores, HttpStatus.BAD_REQUEST); // 400
    }

    // 2. JSON mal formado o con un valor que no se puede leer (por ejemplo, una fecha inválida)
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleJsonInvalido(HttpMessageNotReadableException ex, HttpServletRequest request) {
        return responder(HttpStatus.BAD_REQUEST, "El cuerpo de la petición no tiene un formato válido.", request);
    }

    // 3. Parámetro de la URL con un valor inválido (por ejemplo, fecha=abc)
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleParametroInvalido(MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        return responder(HttpStatus.BAD_REQUEST, "El parámetro '" + ex.getName() + "' no tiene un valor válido.", request);
    }

    // 4. Errores de integridad de la base de datos (duplicados, claves foráneas, triggers)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDatabaseErrors(DataIntegrityViolationException ex, HttpServletRequest request) {
        String causa = ex.getMostSpecificCause().getMessage();

        if (causa != null && causa.contains("ya tiene una cita")) {
            return responder(HttpStatus.CONFLICT, "El médico o el paciente ya tiene una cita en ese horario.", request);
        }
        String mensaje = "Error en la base de datos. Verifique los datos.";
        if (causa != null && causa.contains("El usuario debe tener el rol")) {
            mensaje = "El usuario seleccionado no tiene el rol requerido.";
        } else if (causa != null && causa.contains("Duplicate entry")) {
            mensaje = "El NSS o correo ya se encuentra registrado.";
        }
        return responder(HttpStatus.BAD_REQUEST, mensaje, request);
    }

    // 5. Otros errores de acceso a datos; aquí llega el SIGNAL de los triggers de MySQL
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ErrorResponse> handleDataAccess(DataAccessException ex, HttpServletRequest request) {
        String causa = ex.getMostSpecificCause().getMessage();
        if (causa != null && causa.contains("ya tiene una cita")) {
            return responder(HttpStatus.CONFLICT, "El médico o el paciente ya tiene una cita en ese horario.", request);
        }
        log.error("Error de acceso a datos en {}", request.getRequestURI(), ex);
        return responder(HttpStatus.INTERNAL_SERVER_ERROR, "Ocurrió un error al acceder a la base de datos.", request);
    }

    // 6. Credenciales incorrectas o problemas de autenticación (401)
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthentication(AuthenticationException ex, HttpServletRequest request) {
        return responder(HttpStatus.UNAUTHORIZED, "Correo o contraseña incorrectos", request);
    }

    // 7. Usuario autenticado sin permiso, lo lanza @PreAuthorize o el servicio (403)
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
        return responder(HttpStatus.FORBIDDEN, "No tienes permiso para realizar esta acción", request);
    }

    // 8. Recurso que no existe (404)
    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<ErrorResponse> handleNoEncontrado(RecursoNoEncontradoException ex, HttpServletRequest request) {
        return responder(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    // 9. Choque con el estado actual de los datos, por ejemplo un horario empalmado (409)
    @ExceptionHandler(ConflictoException.class)
    public ResponseEntity<ErrorResponse> handleConflicto(ConflictoException ex, HttpServletRequest request) {
        return responder(HttpStatus.CONFLICT, ex.getMessage(), request);
    }

    // 10. Petición válida que rompe una regla del negocio (422)
    @ExceptionHandler(ReglaNegocioException.class)
    public ResponseEntity<ErrorResponse> handleReglaNegocio(ReglaNegocioException ex, HttpServletRequest request) {
        return responder(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage(), request);
    }

    // 11. Errores generales con mensaje propio (los módulos antiguos aún lanzan RuntimeException)
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex, HttpServletRequest request) {
        return responder(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    // 12. Cualquier otro error: se registra en el servidor y al cliente no se le revelan detalles (500)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex, HttpServletRequest request) {
        log.error("Error inesperado en {}", request.getRequestURI(), ex);
        return responder(HttpStatus.INTERNAL_SERVER_ERROR, "Ocurrió un error inesperado en el servidor.", request);
    }
}