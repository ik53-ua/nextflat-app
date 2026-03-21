package com.ua.nextflat.repository;

import com.ua.nextflat.model.FotoInmueble;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FotoInmuebleRepository extends JpaRepository<FotoInmueble, Long> {
    List<FotoInmueble> findByInmuebleId(Long inmuebleId);
}