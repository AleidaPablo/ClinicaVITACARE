
package mx.vitacare.api.service;

import mx.vitacare.api.model.TokenRevocado;
import mx.vitacare.api.repository.TokenRevocadoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class TokenRevocadoService {

    private final TokenRevocadoRepository repository;

    public TokenRevocadoService(TokenRevocadoRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void revocar(String jti, LocalDateTime expiraEn) {
        if (jti != null && !jti.isBlank() && !repository.existsById(jti)) {
            repository.save(new TokenRevocado(jti, expiraEn));
        }
    }

    @Transactional(readOnly = true)
    public boolean estaRevocado(String jti) {
        return jti != null && repository.existsById(jti);
    }
}
