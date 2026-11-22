package mx.vitacare.api.repository;

import mx.vitacare.api.model.Medico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MedicoRepository extends JpaRepository<Medico, Long> {

    
    long countByActivoTrue();
}