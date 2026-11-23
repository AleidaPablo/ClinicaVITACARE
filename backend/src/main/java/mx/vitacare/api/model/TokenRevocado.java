
package mx.vitacare.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "tokens_revocados")
public class TokenRevocado {

    @Id
    @Column(name = "jti", length = 64)
    private String jti;

    @Column(name = "expira_en", nullable = false)
    private LocalDateTime expiraEn;

    @Column(name = "revocado_en", nullable = false)
    private LocalDateTime revocadoEn;

    public TokenRevocado() {
    }

    public TokenRevocado(String jti, LocalDateTime expiraEn) {
        this.jti = jti;
        this.expiraEn = expiraEn;
    }

    @PrePersist
    public void antesDeGuardar() {
        if (revocadoEn == null) {
            revocadoEn = LocalDateTime.now();
        }
    }

    public String getJti() {
        return jti;
    }

    public void setJti(String jti) {
        this.jti = jti;
    }

    public LocalDateTime getExpiraEn() {
        return expiraEn;
    }

    public void setExpiraEn(LocalDateTime expiraEn) {
        this.expiraEn = expiraEn;
    }

    public LocalDateTime getRevocadoEn() {
        return revocadoEn;
    }

    public void setRevocadoEn(LocalDateTime revocadoEn) {
        this.revocadoEn = revocadoEn;
    }
}
