
package mx.vitacare.api.repository;

import mx.vitacare.api.model.TokenRecuperacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface TokenRecuperacionRepository
        extends JpaRepository<TokenRecuperacion, Long> {

    Optional<TokenRecuperacion>
    findByTokenHashAndUsadoFalseAndExpiraEnAfter(
            String tokenHash,
            LocalDateTime ahora);

    @Modifying
    @Query("UPDATE TokenRecuperacion t SET t.usado = true " +
            "WHERE t.usuario.id = :usuarioId AND t.usado = false")
    int marcarTokensAnterioresComoUsados(
            @Param("usuarioId") Long usuarioId);
}
