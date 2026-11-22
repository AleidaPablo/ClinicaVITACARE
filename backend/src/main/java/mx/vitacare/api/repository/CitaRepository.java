package mx.vitacare.api.repository;

import mx.vitacare.api.model.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {
    List<Cita> findByMedicoIdAndFechaHoraBetween(Long medicoId, LocalDateTime inicio, LocalDateTime fin);

    List<Cita> findByPacienteId(Long pacienteId);

    long countByEstado(String estado);

    long countByFechaHoraBetweenAndEstadoNot(LocalDateTime inicio, LocalDateTime fin, String estado);

    List<Cita> findTop3ByOrderByActualizadoEnDesc();
}