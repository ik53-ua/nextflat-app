package com.ua.nextflat.repository;

import com.ua.nextflat.model.FotoInmueble;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FotoInmuebleRepository extends JpaRepository<FotoInmueble, Long> {
}