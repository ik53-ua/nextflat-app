package com.ua.nextflat.controller;

import com.ua.nextflat.model.Inmueble;
import com.ua.nextflat.repository.InmuebleRepository;
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

    @GetMapping("/mis-inmuebles/{propietarioId}")
    public ResponseEntity<List<Inmueble>> getMisInmuebles(@PathVariable Long propietarioId) {
        List<Inmueble> misPisos = inmuebleRepository.findByPropietarioId(propietarioId);
        return ResponseEntity.ok(misPisos);
    }
}