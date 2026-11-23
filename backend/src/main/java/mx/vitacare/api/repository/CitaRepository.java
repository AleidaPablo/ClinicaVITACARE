package mx.vitacare.api.repository;

import mx.vitacare.api.model.Cita;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Long>, JpaSpecificationExecutor<Cita> {

    @Override
    @EntityGraph(attributePaths = {"paciente.usuario", "medico.usuario"})
    Page<Cita> findAll(Specification<Cita> spec, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"paciente.usuario", "medico.usuario"})
    List<Cita> findAll(Specification<Cita> spec, Sort sort);

    List<Cita> findByMedicoIdAndFechaHoraBetween(Long medicoId, LocalDateTime inicio, LocalDateTime fin);

    List<Cita> findByPacienteId(Long pacienteId);

    boolean existsByPacienteIdAndMedicoId(Long pacienteId, Long medicoId);

    List<Cita> findByMedicoId(Long medicoId);

    List<Cita> findByMedicoIdAndEstadoNotAndFechaHoraBetween(Long medicoId, String estado, LocalDateTime desde, LocalDateTime hasta);

    List<Cita> findByPacienteIdAndEstadoNotAndFechaHoraBetween(Long pacienteId, String estado, LocalDateTime desde, LocalDateTime hasta);

    long countByEstado(String estado);

    long countByFechaHoraBetweenAndEstadoNot(LocalDateTime inicio, LocalDateTime fin, String estado);

    List<Cita> findTop3ByOrderByActualizadoEnDesc();
}