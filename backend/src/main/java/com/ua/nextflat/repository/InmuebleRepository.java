package com.ua.nextflat.repository;

import com.ua.nextflat.model.Inmueble;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InmuebleRepository extends JpaRepository<Inmueble, Long> {
    List<Inmueble> findByPropietarioId(Long propietrarioId);
}