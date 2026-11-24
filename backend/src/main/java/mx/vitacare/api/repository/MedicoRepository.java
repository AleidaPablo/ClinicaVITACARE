
package mx.vitacare.api.repository;

import mx.vitacare.api.model.Medico;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicoRepository extends JpaRepository<Medico, Long> {

    long countByActivoTrue();

    Optional<Medico> findByUsuarioEmail(String email);

    Optional<Medico> findByUsuarioId(Long usuarioId);

    List<Medico> findByActivoTrue();

    @Query("""
        SELECT m FROM Medico m
        JOIN m.usuario u
        WHERE (:nombre IS NULL OR LOWER(u.nombreCompleto) LIKE LOWER(CONCAT('%', :nombre, '%')))
        AND (:email IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :email, '%')))
        AND (:cedula IS NULL OR LOWER(m.cedulaProfesional) LIKE LOWER(CONCAT('%', :cedula, '%')))
        AND (:activo IS NULL OR m.activo = :activo)
        """)
    Page<Medico> buscarConFiltros(
            @Param("nombre") String nombre,
            @Param("email") String email,
            @Param("cedula") String cedula,
            @Param("activo") Boolean activo,
            Pageable pageable
    );

    @Query(value = "SELECT m.id, u.nombre_completo, " +
            "GROUP_CONCAT(DISTINCT e.nombre ORDER BY e.nombre SEPARATOR ', '), m.disponibilidad " +
            "FROM medicos m " +
            "JOIN usuarios u ON u.id = m.usuario_id " +
            "LEFT JOIN medicos_especialidades me ON me.medico_id = m.id " +
            "LEFT JOIN especialidades e ON e.id = me.especialidad_id AND e.activa = TRUE " +
            "WHERE m.activo = TRUE AND u.activo = TRUE " +
            "GROUP BY m.id, u.nombre_completo, m.disponibilidad " +
            "ORDER BY u.nombre_completo",
            nativeQuery = true)
    List<Object[]> listarDirectorioActivo();
}
