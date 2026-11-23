package mx.vitacare.api.controller;

import mx.vitacare.api.dto.PerfilRequestDTO;
import mx.vitacare.api.dto.PerfilResponseDTO;
import mx.vitacare.api.dto.UsuarioRequestDTO;
import mx.vitacare.api.dto.UsuarioResponseDTO;
import mx.vitacare.api.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UsuarioResponseDTO>> listar(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String rol,
            @PageableDefault(size = 50) Pageable pageable) {
        return ResponseEntity.ok(usuarioService.listar(search, rol, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.obtenerPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponseDTO> crear(@Valid @RequestBody UsuarioRequestDTO dto) {
        return new ResponseEntity<>(usuarioService.crear(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioRequestDTO dto,
            Authentication authentication) {
        return ResponseEntity.ok(usuarioService.actualizar(id, dto, authentication));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponseDTO> cambiarEstado(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.cambiarEstado(id));
    }

    

@GetMapping("/me")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<PerfilResponseDTO> obtenerMiPerfil(
        Authentication authentication) {

    return ResponseEntity.ok(
        usuarioService.obtenerMiPerfil(authentication.getName())
    );
}

@PutMapping("/me")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<PerfilResponseDTO> actualizarMiPerfil(
        Authentication authentication,
        @Valid @RequestBody PerfilRequestDTO dto) {

    return ResponseEntity.ok(
        usuarioService.actualizarMiPerfil(authentication.getName(), dto)
    );
}

}
