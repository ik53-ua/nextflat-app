package com.ua.nextflat.controller;

import com.ua.nextflat.dto.FeedInmuebleDTO;
import com.ua.nextflat.dto.SwipeRequestDTO;
import com.ua.nextflat.model.Usuario;
import com.ua.nextflat.service.FeedService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feed")
@CrossOrigin(origins = "http://localhost:5173")
public class FeedController {

    private final FeedService feedService;

    @Autowired
    public FeedController(FeedService feedService) {
        this.feedService = feedService;
    }

    @GetMapping("/{usuarioId}")
    public ResponseEntity<List<FeedInmuebleDTO>> getFeedForUser(
            @PathVariable Long usuarioId,
            @RequestParam(required = false) String municipio,
            @RequestParam(required = false) Double precioMax) {
        // Le pasamos los nuevos filtros al servicio
        List<FeedInmuebleDTO> feed = feedService.getFeedForUser(usuarioId, municipio, precioMax);
        return ResponseEntity.ok(feed);
    }

    @PostMapping("/swipe")
    public ResponseEntity<Void> processSwipe(@RequestBody SwipeRequestDTO request) {
        feedService.processSwipe(request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/rewind/{usuarioId}")
    public ResponseEntity<?> rewindSwipe(@PathVariable Long usuarioId) {
        try {
            FeedInmuebleDTO pisoRecuperado = feedService.rewindLastSwipe(usuarioId);
            return ResponseEntity.ok(pisoRecuperado);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/propietario-rewind/{propietarioId}")
    public ResponseEntity<?> rewindCandidatoSwipe(@PathVariable Long propietarioId) {
        try {
            Usuario candidatoRecuperado = feedService.rewindLastCandidatoSwipe(propietarioId);
            return ResponseEntity.ok(candidatoRecuperado);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/public")
    public ResponseEntity<List<FeedInmuebleDTO>> getPublicFeed() {
        List<FeedInmuebleDTO> feed = feedService.getPublicFeed();
        return ResponseEntity.ok(feed);
    }
}
