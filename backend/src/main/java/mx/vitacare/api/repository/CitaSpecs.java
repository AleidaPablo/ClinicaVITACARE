package mx.vitacare.api.repository;

import mx.vitacare.api.model.Cita;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public final class CitaSpecs {

    private CitaSpecs() {
    }

    public static Specification<Cita> todas() {
        return (root, query, cb) -> cb.conjunction();
    }

    public static Specification<Cita> conEstado(String estado) {
        return (root, query, cb) -> cb.equal(root.get("estado"), estado);
    }

    public static Specification<Cita> entre(LocalDateTime desde, LocalDateTime hasta) {
        return (root, query, cb) -> cb.and(
                cb.greaterThanOrEqualTo(root.<LocalDateTime>get("fechaHora"), desde),
                cb.lessThan(root.<LocalDateTime>get("fechaHora"), hasta));
    }

    public static Specification<Cita> deMedico(Long medicoId) {
        return (root, query, cb) -> cb.equal(root.get("medico").get("id"), medicoId);
    }

    public static Specification<Cita> dePaciente(Long pacienteId) {
        return (root, query, cb) -> cb.equal(root.get("paciente").get("id"), pacienteId);
    }
}