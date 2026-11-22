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
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(citaService.listarPaginadas(pacienteId, medicoId, estado, pageable));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PATIENT', 'DOCTOR')")
    public ResponseEntity<CitaResponseDTO> crear(@Valid @RequestBody CitaRequestDTO dto) {
        return new ResponseEntity<>(citaService.crear(dto), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PATIENT')")
    public ResponseEntity<CitaResponseDTO> cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody CambioEstadoRequestDTO dto) {
        return ResponseEntity.ok(citaService.cambiarEstado(id, dto.getEstado()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<CitaResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody CitaRequestDTO dto) {
        return ResponseEntity.ok(citaService.actualizar(id, dto));
    }
}