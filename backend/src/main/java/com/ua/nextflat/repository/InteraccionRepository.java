package com.ua.nextflat.repository;

import com.ua.nextflat.model.Interaccion;
import com.ua.nextflat.model.Usuario;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InteraccionRepository extends JpaRepository<Interaccion, Long> {

       @Query(value = "SELECT DISTINCT u.* FROM usuarios u " +
                     "JOIN interacciones i ON i.usuario_origen_id = u.id " +
                     "JOIN inmuebles inm ON i.inmueble_destino_id = inm.id " +
                     "LEFT JOIN permisos_gestion pg ON pg.inmueble_id = inm.id AND pg.activo = true " +
                     "WHERE (inm.propietario_id = :propietarioId OR pg.inquilino_gestor_id = :propietarioId) " +
                     "AND i.tipo = 'LIKE' " +
                     "AND NOT EXISTS (" +
                     "  SELECT 1 FROM interacciones ev " +
                     "  WHERE ev.usuario_origen_id = :propietarioId " +
                     "  AND ev.usuario_id_target = u.id" +
                     ")", nativeQuery = true)
       List<Usuario> findCandidatosParaPropietario(@Param("propietarioId") Long propietarioId);

       @Query(value = "SELECT i.* FROM interacciones i " +
                     "JOIN inmuebles inm ON i.inmueble_destino_id = inm.id " +
                     "LEFT JOIN permisos_gestion pg ON pg.inmueble_id = inm.id AND pg.activo = true " +
                     "WHERE i.usuario_origen_id = :candidatoId " +
                     "AND (inm.propietario_id = :propietarioId OR pg.inquilino_gestor_id = :propietarioId) " +
                     "AND i.tipo = 'LIKE' " +
                     "ORDER BY i.fecha DESC", nativeQuery = true)
       List<Interaccion> findLikesDeCandidatoEnPisosDelPropietario(
                     @Param("candidatoId") Long candidatoId,
                     @Param("propietarioId") Long propietarioId);

       Optional<Interaccion> findFirstByUsuarioOrigenIdOrderByFechaDesc(Long usuarioOrigenId);
}
