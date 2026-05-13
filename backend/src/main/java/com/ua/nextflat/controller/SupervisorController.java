package com.ua.nextflat.controller;

import com.ua.nextflat.model.Usuario;
import com.ua.nextflat.model.enums.EstadoVerificacion;
import com.ua.nextflat.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/supervisor")
@CrossOrigin(origins = "http://localhost:5173")
public class SupervisorController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @GetMapping("/pendientes")
    public ResponseEntity<List<Usuario>> obtenerPendientes() {
        List<Usuario> pendientes = usuarioRepository.findByEstadoVerificacion(EstadoVerificacion.EN_REVISION);
        
        // Fallback por si la base de datos no actualizó bien el Enum pero sí guardó la URL del documento
        if (pendientes.isEmpty()) {
            pendientes = usuarioRepository.findAll().stream()
                .filter(u -> u.getDocumentoVerificacionUrl() != null 
                          && u.getEstadoVerificacion() != EstadoVerificacion.VERIFICADO)
                .toList();
        }
        
        return ResponseEntity.ok(pendientes);
    }

    @PostMapping("/aprobar/{id}")
    public ResponseEntity<Usuario> aprobarVerificacion(@PathVariable Long id) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(id);
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            usuario.setEstadoVerificacion(EstadoVerificacion.VERIFICADO);
            usuarioRepository.save(usuario);
            return ResponseEntity.ok(usuario);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/denegar/{id}")
    public ResponseEntity<Usuario> denegarVerificacion(@PathVariable Long id) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(id);
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            usuario.setEstadoVerificacion(EstadoVerificacion.DENEGADO);
            usuario.setDocumentoVerificacionUrl(null); // Clear the document
            usuarioRepository.save(usuario);
            return ResponseEntity.ok(usuario);
        }
        return ResponseEntity.notFound().build();
    }
}
