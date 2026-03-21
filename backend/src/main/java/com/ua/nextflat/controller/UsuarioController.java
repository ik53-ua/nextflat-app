package com.ua.nextflat.controller;

import com.ua.nextflat.model.Usuario;
import com.ua.nextflat.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:5173")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * US 021: Solicitar Verificación
     */
    @PostMapping("/{id}/solicitar-verificacion")
    public ResponseEntity<Usuario> solicitarVerificacion(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(id);
        
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            String documentoUrl = payload.get("url");
            usuario.setDocumentoVerificacionUrl(documentoUrl);
            usuarioRepository.save(usuario);
            return ResponseEntity.ok(usuario);
        }
        
        return ResponseEntity.notFound().build();
    }

    /**
     * US 021: Simulación de Aprobación
     */
    @PostMapping("/admin/verify/{id}")
    public ResponseEntity<Usuario> aprobarVerificacion(@PathVariable Long id) {
        
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(id);
        
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            usuario.setVerificado(true);
            usuarioRepository.save(usuario);
            return ResponseEntity.ok(usuario);
        }
        
        return ResponseEntity.notFound().build();
    }
}