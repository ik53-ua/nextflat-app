package com.ua.nextflat.controller;

import com.ua.nextflat.model.FotoInmueble;
import com.ua.nextflat.model.Inmueble;
import com.ua.nextflat.repository.FotoInmuebleRepository;
import com.ua.nextflat.repository.InmuebleRepository;
import com.ua.nextflat.dto.DetalleInmuebleDTO;
import com.ua.nextflat.service.InmuebleService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import jakarta.persistence.EntityManager;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/inmuebles")
@CrossOrigin(origins = "http://localhost:5173")
public class InmuebleController {


    @Autowired
    private InmuebleRepository inmuebleRepository;

    @Autowired
    private FotoInmuebleRepository fotoInmuebleRepository;

    @Autowired
    private InmuebleService inmuebleService;

    @Autowired
    private EntityManager entityManager;

    @GetMapping("/mis-inmuebles/{propietarioId}")
    public ResponseEntity<List<Inmueble>> getMisInmuebles(@PathVariable Long propietarioId) {
        
        List<Inmueble> misPisos = inmuebleRepository.findByPropietarioId(propietarioId);
        
        for (Inmueble piso : misPisos) {
            List<FotoInmueble> fotos = fotoInmuebleRepository.findByInmuebleId(piso.getId());
            if (!fotos.isEmpty()) {
                piso.setFotoPrincipal(fotos.get(0).getUrl());
            }
        }
        
        return ResponseEntity.ok(misPisos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetalleInmuebleDTO> getDetalleInmueble(@PathVariable Long id) {
        DetalleInmuebleDTO detalle = inmuebleService.getDetalleInmueble(id);
        return ResponseEntity.ok(detalle);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Inmueble> actualizarInmueble(@PathVariable Long id, @RequestBody Inmueble inmuebleActualizado) {
        Optional<Inmueble> opt = inmuebleRepository.findById(id);
        if (opt.isPresent()) {
            Inmueble existente = opt.get();
            existente.setPrecio(inmuebleActualizado.getPrecio());
            existente.setDireccion(inmuebleActualizado.getDireccion());
            existente.setMunicipio(inmuebleActualizado.getMunicipio());
            existente.setDescripcion(inmuebleActualizado.getDescripcion());
            existente.setNumHabitaciones(inmuebleActualizado.getNumHabitaciones());
            existente.setNumBanos(inmuebleActualizado.getNumBanos());
            existente.setTieneAscensor(inmuebleActualizado.isTieneAscensor());
            existente.setAdmiteMascotas(inmuebleActualizado.isAdmiteMascotas());
            existente.setEsCompartido(inmuebleActualizado.isEsCompartido());
            
            inmuebleRepository.save(existente);
            return ResponseEntity.ok(existente);
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Inmueble> cambiarEstadoInmueble(@PathVariable Long id) {
        Optional<Inmueble> opt = inmuebleRepository.findById(id);
        if (opt.isPresent()) {
            Inmueble piso = opt.get();
            piso.setActivo(!piso.isActivo());
            inmuebleRepository.save(piso);
            return ResponseEntity.ok(piso);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> eliminarInmueble(@PathVariable Long id) {
        if (inmuebleRepository.existsById(id)) {
            // Delete dependent records using native queries to bypass missing cascade configurations
            entityManager.createNativeQuery("DELETE FROM matches WHERE inmueble_id = :id").setParameter("id", id).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM interacciones WHERE inmueble_destino_id = :id").setParameter("id", id).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM permisos_gestion WHERE inmueble_id = :id").setParameter("id", id).executeUpdate();
            
            // Delete photos explicitly
            List<FotoInmueble> fotos = fotoInmuebleRepository.findByInmuebleId(id);
            fotoInmuebleRepository.deleteAll(fotos);
            
            inmuebleRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/fotos")
    public ResponseEntity<List<FotoInmueble>> getFotosInmueble(@PathVariable Long id) {
        List<FotoInmueble> fotos = fotoInmuebleRepository.findByInmuebleId(id);
        return ResponseEntity.ok(fotos);
    }

    @PostMapping("/{id}/fotos")
    public ResponseEntity<FotoInmueble> agregarFotoInmueble(@PathVariable Long id, @RequestBody FotoInmueble foto) {
        Optional<Inmueble> opt = inmuebleRepository.findById(id);
        if (opt.isPresent()) {
            foto.setInmueble(opt.get());
            FotoInmueble fotoGuardada = fotoInmuebleRepository.save(foto);
            return ResponseEntity.ok(fotoGuardada);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{inmuebleId}/fotos/{fotoId}")
    public ResponseEntity<Void> eliminarFoto(@PathVariable Long inmuebleId, @PathVariable Long fotoId) {
        Optional<FotoInmueble> fotoOpt = fotoInmuebleRepository.findById(fotoId);
        if (fotoOpt.isPresent()) {
            FotoInmueble foto = fotoOpt.get();
            if (foto.getInmueble().getId().equals(inmuebleId)) {
                fotoInmuebleRepository.deleteById(fotoId);
                return ResponseEntity.noContent().build();
            }
        }
        return ResponseEntity.notFound().build();
    }
}