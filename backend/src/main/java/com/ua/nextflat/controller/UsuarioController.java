package com.ua.nextflat.controller;

import com.ua.nextflat.model.Usuario;
import com.ua.nextflat.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:5173")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping("/registro")
    public ResponseEntity<Usuario> registrarUsuario(@RequestBody Usuario nuevoUsuario) {
        try {
            Usuario usuarioGuardado = usuarioRepository.save(nuevoUsuario);
            return ResponseEntity.ok(usuarioGuardado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> iniciarSesion(@RequestBody Usuario credenciales) {
        try {
            Optional<Usuario> usuarioEncontrado = usuarioRepository.findAll().stream()
                    .filter(u -> u.getEmail().equals(credenciales.getEmail()) && 
                                 u.getPassword().equals(credenciales.getPassword()))
                    .findFirst();

            if (usuarioEncontrado.isPresent()) {
                return ResponseEntity.ok(usuarioEncontrado.get()); // Login correcto
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales incorrectas"); // Fallo
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}