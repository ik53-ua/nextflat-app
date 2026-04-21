package com.ua.nextflat.controller;

import com.ua.nextflat.dto.DetalleInmuebleDTO;
import com.ua.nextflat.service.InmuebleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inmuebles")
@CrossOrigin(origins = "http://localhost:5173")
public class InmuebleController {

    private final InmuebleService inmuebleService;

    @Autowired
    public InmuebleController(InmuebleService inmuebleService) {
        this.inmuebleService = inmuebleService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetalleInmuebleDTO> getDetalleInmueble(@PathVariable Long id) {
        DetalleInmuebleDTO detalle = inmuebleService.getDetalleInmueble(id);
        return ResponseEntity.ok(detalle);
    }
}
