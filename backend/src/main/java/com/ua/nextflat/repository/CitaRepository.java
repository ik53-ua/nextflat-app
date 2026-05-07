package com.ua.nextflat.repository;

import com.ua.nextflat.model.Cita;
import com.ua.nextflat.model.enums.EstadoCita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {
    List<Cita> findByPropietarioIdOrderByFechaHoraAsc(Long propietarioId);
    List<Cita> findByInquilinoIdOrderByFechaHoraAsc(Long inquilinoId);
    List<Cita> findByInmuebleIdOrderByFechaHoraAsc(Long inmuebleId);
    List<Cita> findByEstado(EstadoCita estado);
}
