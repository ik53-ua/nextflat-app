package com.ua.nextflat.controller;

import com.ua.nextflat.dto.CitaDTO;
import com.ua.nextflat.dto.NuevaCitaDTO;
import com.ua.nextflat.model.enums.EstadoCita;
import com.ua.nextflat.service.CitaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/citas")
@CrossOrigin(origins = "http://localhost:5173")
public class CitaController {

    @Autowired
    private CitaService citaService;

    @PostMapping
    public ResponseEntity<CitaDTO> crearCita(@RequestBody NuevaCitaDTO request) {
        CitaDTO nuevaCita = citaService.crearCita(request);
        return ResponseEntity.ok(nuevaCita);
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<CitaDTO>> obtenerCitasUsuario(@PathVariable Long usuarioId) {
        List<CitaDTO> citas = citaService.obtenerCitasUsuario(usuarioId);
        return ResponseEntity.ok(citas);
    }

    @PutMapping("/{citaId}/estado")
    public ResponseEntity<CitaDTO> actualizarEstadoCita(@PathVariable Long citaId, @RequestBody Map<String, String> body) {
        String estadoStr = body.get("estado");
        if (estadoStr == null) {
            return ResponseEntity.badRequest().build();
        }
        EstadoCita estado = EstadoCita.valueOf(estadoStr.toUpperCase());
        CitaDTO actualizada = citaService.actualizarEstadoCita(citaId, estado);
        return ResponseEntity.ok(actualizada);
    }

    @DeleteMapping("/{citaId}/usuario/{usuarioId}")
    public ResponseEntity<Void> eliminarDeCalendario(@PathVariable Long citaId, @PathVariable Long usuarioId) {
        citaService.ocultarCitaParaUsuario(citaId, usuarioId);
        return ResponseEntity.ok().build();
    }
}
