package mx.vitacare.api.controller;

import mx.vitacare.api.dto.ConsultaRequestDTO;
import mx.vitacare.api.dto.ExpedienteRequestDTO;
import mx.vitacare.api.dto.ExpedienteResponseDTO;
import mx.vitacare.api.service.ExpedienteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import java.util.List;

@RestController
@RequestMapping("/api/expedientes")
public class ExpedienteController {

    private final ExpedienteService expedienteService;

    public ExpedienteController(ExpedienteService expedienteService) {
        this.expedienteService = expedienteService;
    }

   
@GetMapping
@PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
public ResponseEntity<Page<ExpedienteResponseDTO>> listarTodos(
        @RequestParam(required = false) String nombre,
        @RequestParam(required = false) String correo,
        @PageableDefault(size = 10) Pageable pageable,
        Authentication autenticacion) {

    return ResponseEntity.ok(expedienteService.listarPaginados(
            nombre,
            correo,
            pageable,
            autenticacion.getName(),
            obtenerRol(autenticacion)));
}


    @GetMapping("/paciente/{pacienteId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PATIENT')")
    public ResponseEntity<ExpedienteResponseDTO> obtenerPorPacienteId(
            @PathVariable Long pacienteId,
            Authentication autenticacion) {
        return ResponseEntity.ok(expedienteService.obtenerPorPacienteId(
                pacienteId,
                autenticacion.getName(),
                obtenerRol(autenticacion)));
    }

    @PutMapping("/paciente/{pacienteId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ExpedienteResponseDTO> actualizarResumen(
            @PathVariable Long pacienteId,
            @RequestBody ExpedienteRequestDTO dto,
            Authentication autenticacion) {
        return ResponseEntity.ok(expedienteService.actualizarResumen(
                pacienteId,
                dto,
                autenticacion.getName(),
                obtenerRol(autenticacion)));
    }

    @PostMapping("/paciente/{pacienteId}/consultas")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ExpedienteResponseDTO> agregarConsulta(
            @PathVariable Long pacienteId,
            @Valid @RequestBody ConsultaRequestDTO dto,
            Authentication autenticacion) {
        return new ResponseEntity<>(
                expedienteService.agregarConsulta(
                        pacienteId,
                        dto,
                        autenticacion.getName(),
                        obtenerRol(autenticacion)),
                HttpStatus.CREATED);
    }

    @GetMapping("/mi-expediente")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ExpedienteResponseDTO> obtenerMiExpediente(Authentication autenticacion) {
        return ResponseEntity.ok(expedienteService.obtenerMiExpediente(autenticacion.getName()));
    }

    private String obtenerRol(Authentication autenticacion) {
        return autenticacion.getAuthorities().stream()
                .map(autoridad -> autoridad.getAuthority())
                .filter(autoridad -> autoridad.startsWith("ROLE_"))
                .map(autoridad -> autoridad.substring(5))
                .findFirst()
                .orElse("");
    }
}
