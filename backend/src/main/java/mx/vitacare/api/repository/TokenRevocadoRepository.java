
package mx.vitacare.api.repository;

import mx.vitacare.api.model.TokenRevocado;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TokenRevocadoRepository extends JpaRepository<TokenRevocado, String> {
}
