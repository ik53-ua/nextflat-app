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
}