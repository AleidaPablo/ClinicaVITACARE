package mx.vitacare.api.controller;

import mx.vitacare.api.dto.MedicoRequestDTO;
import mx.vitacare.api.dto.MedicoResponseDTO;
import mx.vitacare.api.dto.DirectorioMedicoDTO;
import mx.vitacare.api.service.MedicoService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicos")
public class MedicoController {

    private final MedicoService medicoService;

    public MedicoController(MedicoService medicoService) {
        this.medicoService = medicoService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<Page<MedicoResponseDTO>> listar(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(medicoService.listar(pageable));
    }

    @GetMapping("/directorio")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PATIENT')")
    public ResponseEntity<List<DirectorioMedicoDTO>> listarDirectorioActivo() {
        return ResponseEntity.ok(medicoService.listarDirectorioActivo());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MedicoResponseDTO> crear(@Valid @RequestBody MedicoRequestDTO dto) {
        return new ResponseEntity<>(medicoService.crear(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MedicoResponseDTO> actualizar(@PathVariable Long id, @Valid @RequestBody MedicoRequestDTO dto) {
        return ResponseEntity.ok(medicoService.actualizar(id, dto));
    }
}