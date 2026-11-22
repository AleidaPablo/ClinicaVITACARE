package mx.vitacare.api.repository;

import mx.vitacare.api.model.Consulta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsultaRepository extends JpaRepository<Consulta, Long> {

    List<Consulta> findByExpedienteIdOrderByFechaConsultaDesc(Long expedienteId);

    long countByExpedienteId(Long expedienteId);
}
