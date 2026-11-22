package mx.vitacare.api.repository;

import mx.vitacare.api.model.Medico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicoRepository extends JpaRepository<Medico, Long> {

    long countByActivoTrue();

    Optional<Medico> findByUsuarioEmail(String email);

    List<Medico> findByActivoTrue();
}