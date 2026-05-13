package com.ua.nextflat.repository;

import com.ua.nextflat.model.PermisosGestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PermisosGestionRepository extends JpaRepository<PermisosGestion, Long> {
    
    List<PermisosGestion> findByInmuebleIdAndActivoTrue(Long inmuebleId);
    
    boolean existsByInquilinoGestorIdAndActivoTrue(Long gestorId);
    
    Optional<PermisosGestion> findByInmuebleIdAndInquilinoGestorIdAndActivoTrue(Long inmuebleId, Long gestorId);

    List<PermisosGestion> findByInquilinoGestorIdAndActivoTrue(Long gestorId);
}