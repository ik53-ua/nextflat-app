package com.ua.nextflat.repository;

import com.ua.nextflat.model.GrupoBusqueda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface GrupoBusquedaRepository extends JpaRepository<GrupoBusqueda, Long> {
    boolean existsByCodigoInvitacion(String codigoInvitacion);
    Optional<GrupoBusqueda> findByCodigoInvitacion(String codigoInvitacion);
}