package com.ua.nextflat.repository;

import com.ua.nextflat.model.Inmueble;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InmuebleRepository extends JpaRepository<Inmueble, Long> {

    List<Inmueble> findByPropietarioId(Long propietrarioId);

    @Query("SELECT i FROM Inmueble i WHERE i.activo = true " +
            "AND i.propietario.id NOT IN :usuariosIds " +
            "AND NOT EXISTS (SELECT 1 FROM Interaccion int WHERE int.inmuebleDestino.id = i.id AND int.usuarioOrigen.id IN :usuariosIds) " +
            "AND (:municipio IS NULL OR LOWER(i.municipio) = :municipio) " +
            "AND (:precioMax IS NULL OR i.precio <= :precioMax)")
    List<Inmueble> findFeedForUser(@Param("usuariosIds") List<Long> usuariosIds,
            @Param("municipio") String municipio,
            @Param("precioMax") Double precioMax);

    @Query(value = "SELECT * FROM inmuebles WHERE activo = true ORDER BY RANDOM() LIMIT 5", nativeQuery = true)
    List<Inmueble> findRandomPublicFlats();
}