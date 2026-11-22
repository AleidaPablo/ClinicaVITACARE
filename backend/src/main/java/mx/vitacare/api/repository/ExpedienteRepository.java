package mx.vitacare.api.repository;

import mx.vitacare.api.model.Expediente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExpedienteRepository extends JpaRepository<Expediente, Long> {

    Optional<Expediente> findByPacienteId(Long pacienteId);

    Optional<Expediente> findByPacienteUsuarioEmail(String email);

    Boolean existsByPacienteId(Long pacienteId);
}
