package com.ua.nextflat.repository;

import com.ua.nextflat.model.Valoracion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ValoracionRepository extends JpaRepository<Valoracion, Long> {

    /**
     * Todas las valoraciones recibidas por un usuario (para el listado del perfil)
     */
    List<Valoracion> findByDestinoIdOrderByFechaDesc(Long destinoId);

    /** Comprobar si el autor ya valoró al destino (evitar duplicados) */
    Optional<Valoracion> findByAutorIdAndDestinoId(Long autorId, Long destinoId);

    /** Media y conteo de valoraciones de un usuario */
    @Query("SELECT AVG(v.puntuacion) FROM Valoracion v WHERE v.destino.id = :destinoId")
    Double calcularMedia(@Param("destinoId") Long destinoId);

    @Query("SELECT COUNT(v) FROM Valoracion v WHERE v.destino.id = :destinoId")
    Long contarValoraciones(@Param("destinoId") Long destinoId);
}