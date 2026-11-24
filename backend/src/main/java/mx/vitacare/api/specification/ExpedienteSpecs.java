
package mx.vitacare.api.specification;

import mx.vitacare.api.model.Expediente;
import org.springframework.data.jpa.domain.Specification;

public final class ExpedienteSpecs {

    private ExpedienteSpecs() {
    }

    public static Specification<Expediente> todas() {
        return (root, query, cb) -> cb.conjunction();
    }

    public static Specification<Expediente> porNombrePaciente(String nombre) {
        return (root, query, cb) ->
                cb.like(
                        cb.lower(root.get("paciente")
                                .get("usuario")
                                .get("nombreCompleto")),
                        "%" + nombre.toLowerCase() + "%"
                );
    }

    public static Specification<Expediente> porCorreoPaciente(String correo) {
        return (root, query, cb) ->
                cb.like(
                        cb.lower(root.get("paciente")
                                .get("usuario")
                                .get("email")),
                        "%" + correo.toLowerCase() + "%"
                );
    }
}
