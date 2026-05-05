package com.ua.nextflat.repository;

import com.ua.nextflat.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    Optional<Usuario> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    java.util.List<Usuario> findByEstadoVerificacion(com.ua.nextflat.model.enums.EstadoVerificacion estado);
    java.util.List<Usuario> findByGrupoId(Long grupoId);
}