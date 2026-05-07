package com.ua.nextflat.repository;

import com.ua.nextflat.model.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {

        @Query("SELECT m FROM Match m " +
                        "WHERE (m.inquilino.id = :userId OR m.propietario.id = :userId) " +
                        "AND m.activo = true " +
                        "ORDER BY m.fechaMatch DESC")
        List<Match> findActiveMatchesByUserId(@Param("userId") Long userId);

        @Query("SELECT COUNT(m) FROM Match m " +
                        "WHERE m.activo = true " +
                        "AND ((m.inquilino.id = :userAId AND m.propietario.id = :userBId) " +
                        "  OR (m.inquilino.id = :userBId AND m.propietario.id = :userAId))")
        Long countMatchBetweenUsers(@Param("userAId") Long userAId,
                        @Param("userBId") Long userBId);
}
