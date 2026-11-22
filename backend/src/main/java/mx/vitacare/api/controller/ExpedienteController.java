package mx.vitacare.api.controller;

import mx.vitacare.api.dto.ConsultaRequestDTO;
import mx.vitacare.api.dto.ExpedienteRequestDTO;
import mx.vitacare.api.dto.ExpedienteResponseDTO;
import mx.vitacare.api.service.ExpedienteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<List<ExpedienteResponseDTO>> listarTodos() {
        return ResponseEntity.ok(expedienteService.listarTodos());
    }

    @GetMapping("/paciente/{pacienteId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PATIENT')")
    public ResponseEntity<ExpedienteResponseDTO> obtenerPorPacienteId(@PathVariable Long pacienteId) {
        return ResponseEntity.ok(expedienteService.obtenerOCrearPorPacienteId(pacienteId));
    }

    @PutMapping("/paciente/{pacienteId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ExpedienteResponseDTO> actualizarResumen(
            @PathVariable Long pacienteId,
            @RequestBody ExpedienteRequestDTO dto) {
        return ResponseEntity.ok(expedienteService.actualizarResumen(pacienteId, dto));
    }

    @PostMapping("/paciente/{pacienteId}/consultas")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ExpedienteResponseDTO> agregarConsulta(
            @PathVariable Long pacienteId,
            @Valid @RequestBody ConsultaRequestDTO dto) {
        return new ResponseEntity<>(expedienteService.agregarConsulta(pacienteId, dto), HttpStatus.CREATED);
    }

    @GetMapping("/mi-expediente")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ExpedienteResponseDTO> obtenerMiExpediente(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(expedienteService.obtenerMiExpediente(userDetails.getUsername()));
    }
}
