package com.ua.nextflat.repository;

import com.ua.nextflat.model.Inmueble;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InmuebleRepository extends JpaRepository<Inmueble, Long> {

    @Query("SELECT i FROM Inmueble i WHERE i.activo = true " +
           "AND i.propietario.id != :usuarioId " +
           "AND NOT EXISTS (SELECT 1 FROM Interaccion int WHERE int.inmuebleDestino.id = i.id AND int.usuarioOrigen.id = :usuarioId)")
    List<Inmueble> findFeedForUser(@Param("usuarioId") Long usuarioId);
}