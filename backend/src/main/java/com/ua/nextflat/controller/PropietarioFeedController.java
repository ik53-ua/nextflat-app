package com.ua.nextflat.controller;

import com.ua.nextflat.dto.CandidatoFeedDTO;
import com.ua.nextflat.dto.SwipeCandidatoRequestDTO;
import com.ua.nextflat.service.PropietarioFeedService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/propietario-feed")
@CrossOrigin(origins = "http://localhost:5173")
public class PropietarioFeedController {

    private final PropietarioFeedService propietarioFeedService;

    @Autowired
    public PropietarioFeedController(PropietarioFeedService propietarioFeedService) {
        this.propietarioFeedService = propietarioFeedService;
    }

    /**
     * GET /api/propietario-feed/{propietarioId}
     * Devuelve la lista de candidatos que han dado LIKE a algún piso del propietario
     * y que aún no han sido evaluados por él.
     */
    @GetMapping("/{propietarioId}")
    public ResponseEntity<List<CandidatoFeedDTO>> getCandidatos(
            @PathVariable Long propietarioId) {
        List<CandidatoFeedDTO> candidatos =
                propietarioFeedService.getCandidatosParaPropietario(propietarioId);
        return ResponseEntity.ok(candidatos);
    }

    /**
     * POST /api/propietario-feed/swipe
     * Registra el swipe del propietario (LIKE / DISLIKE) sobre un candidato.
     * Body: { propietarioId, candidatoId, tipoInteraccion }
     */
    @PostMapping("/swipe")
    public ResponseEntity<Void> swipeCandidato(
            @RequestBody SwipeCandidatoRequestDTO request) {
        propietarioFeedService.processSwipePropietario(request);
        return ResponseEntity.ok().build();
    }
}
