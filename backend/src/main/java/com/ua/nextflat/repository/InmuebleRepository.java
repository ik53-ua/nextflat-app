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
            "AND (COALESCE(:usuariosIds, NULL) IS NULL OR i.propietario.id NOT IN :usuariosIds) " +
            "AND (COALESCE(:usuariosIds, NULL) IS NULL OR NOT EXISTS (SELECT 1 FROM Interaccion int WHERE int.inmuebleDestino.id = i.id AND int.usuarioOrigen.id IN :usuariosIds)) " +
            "AND (:municipio IS NULL OR LOWER(i.municipio) = :municipio) " +
            "AND (:precioMin IS NULL OR i.precio >= :precioMin) " +
            "AND (:precioMax IS NULL OR i.precio <= :precioMax) " +
            "AND (:numHabitaciones IS NULL OR i.numHabitaciones >= :numHabitaciones) " +
            "AND (:numBanos IS NULL OR i.numBanos >= :numBanos) " +
            "AND (:tieneAscensor IS NULL OR i.tieneAscensor = :tieneAscensor) " +
            "AND (:admiteMascotas IS NULL OR i.admiteMascotas = :admiteMascotas) " +
            "AND (:esCompartido IS NULL OR i.esCompartido = :esCompartido)")
    List<Inmueble> findFeedForUser(@Param("usuariosIds") List<Long> usuariosIds,
            @Param("municipio") String municipio,
            @Param("precioMin") java.math.BigDecimal precioMin,
            @Param("precioMax") java.math.BigDecimal precioMax,
            @Param("numHabitaciones") Integer numHabitaciones,
            @Param("numBanos") Integer numBanos,
            @Param("tieneAscensor") Boolean tieneAscensor,
            @Param("admiteMascotas") Boolean admiteMascotas,
            @Param("esCompartido") Boolean esCompartido);

    @Query(value = "SELECT * FROM inmuebles WHERE activo = true ORDER BY RANDOM() LIMIT 5", nativeQuery = true)
    List<Inmueble> findRandomPublicFlats();
}