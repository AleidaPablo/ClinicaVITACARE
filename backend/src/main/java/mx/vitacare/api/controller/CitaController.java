package mx.vitacare.api.controller;

import mx.vitacare.api.dto.CambioEstadoRequestDTO;
import mx.vitacare.api.dto.CitaRequestDTO;
import mx.vitacare.api.dto.CitaResponseDTO;
import mx.vitacare.api.service.CitaService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/citas")
public class CitaController {

    private final CitaService citaService;

    public CitaController(CitaService citaService) {
        this.citaService = citaService;
    }

    @GetMapping
@PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PATIENT')")
public ResponseEntity<Page<CitaResponseDTO>> listar(
        @RequestParam(required = false) Long pacienteId,
        @RequestParam(required = false) Long medicoId,
        @RequestParam(required = false) String estado,
        @RequestParam(required = false) String fecha,
        @PageableDefault(size = 10, page = 0) Pageable pageable,
        Authentication autenticacion) {

    return ResponseEntity.ok(
            citaService.listarPaginadas(
                    pacienteId,
                    medicoId,
                    estado,
                    fecha,
                    pageable,
                    autenticacion.getName(),
                    obtenerRol(autenticacion)
            )
    );
}

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PATIENT', 'DOCTOR')")
    public ResponseEntity<CitaResponseDTO> crear(
            @Valid @RequestBody CitaRequestDTO dto,
            Authentication autenticacion) {
        return new ResponseEntity<>(
                citaService.crear(dto, autenticacion.getName(), obtenerRol(autenticacion)),
                HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PATIENT')")
    public ResponseEntity<CitaResponseDTO> cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody CambioEstadoRequestDTO dto,
            Authentication autenticacion) {
        return ResponseEntity.ok(citaService.cambiarEstado(
                id,
                dto.getEstado(),
                autenticacion.getName(),
                obtenerRol(autenticacion)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<CitaResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody CitaRequestDTO dto,
            Authentication autenticacion) {
        return ResponseEntity.ok(citaService.actualizar(
                id,
                dto,
                autenticacion.getName(),
                obtenerRol(autenticacion)));
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