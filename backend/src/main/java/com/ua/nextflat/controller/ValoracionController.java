package com.ua.nextflat.controller;

import com.ua.nextflat.dto.ValoracionDTO;
import com.ua.nextflat.dto.ValoracionResponseDTO;
import com.ua.nextflat.service.ValoracionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/valoraciones")
@CrossOrigin(origins = "http://localhost:5173")
public class ValoracionController {

    @Autowired
    private ValoracionService valoracionService;

    /**
     * POST /api/valoraciones
     * Crea una nueva valoración. Valida match previo, duplicados y rango 1-5.
     */
    @PostMapping
    public ResponseEntity<?> crearValoracion(@RequestBody ValoracionDTO dto) {
        try {
            ValoracionResponseDTO resultado = valoracionService.crearValoracion(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(resultado);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * GET /api/valoraciones/usuario/{destinoId}
     * Devuelve el listado histórico de valoraciones recibidas por un usuario.
     */
    @GetMapping("/usuario/{destinoId}")
    public ResponseEntity<List<ValoracionResponseDTO>> getValoraciones(@PathVariable Long destinoId) {
        return ResponseEntity.ok(valoracionService.getValoracionesByDestino(destinoId));
    }

    /**
     * GET /api/valoraciones/usuario/{destinoId}/stats
     * Devuelve { media: 4.3, total: 12 } para el perfil público.
     */
    @GetMapping("/usuario/{destinoId}/stats")
    public ResponseEntity<Map<String, Object>> getStats(@PathVariable Long destinoId) {
        return ResponseEntity.ok(valoracionService.getStatsValoracion(destinoId));
    }

    /**
     * GET /api/valoraciones/check?autorId=X&destinoId=Y
     * Comprueba si el autor ya valoró al destino (para deshabilitar el botón en
     * UI).
     */
    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> checkYaValorado(
            @RequestParam Long autorId,
            @RequestParam Long destinoId) {
        boolean yaValorado = valoracionService.yaValorado(autorId, destinoId);
        return ResponseEntity.ok(Map.of("yaValorado", yaValorado));
    }
}