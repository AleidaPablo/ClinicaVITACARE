
package mx.vitacare.api.repository;

import mx.vitacare.api.model.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    Boolean existsByEmail(String email);

    @Query("SELECT u FROM Usuario u WHERE " +
           "(:rol IS NULL OR :rol = '' OR :rol = 'Todos' OR u.rol.nombre = :rol) AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(u.nombreCompleto) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Usuario> buscarUsuarios(
            @Param("search") String search,
            @Param("rol") String rol,
            Pageable pageable);

    @Modifying
    @Transactional
    @Query("UPDATE Usuario u SET u.contrasena = :contrasena WHERE u.id = :usuarioId")
    int actualizarContrasena(
            @Param("usuarioId") Long usuarioId,
            @Param("contrasena") String contrasena);

    long countByRolNombre(String rolNombre);
}
