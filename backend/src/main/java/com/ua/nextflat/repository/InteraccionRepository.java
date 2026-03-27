package com.ua.nextflat.repository;

import com.ua.nextflat.model.Interaccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InteraccionRepository extends JpaRepository<Interaccion, Long> {
}
