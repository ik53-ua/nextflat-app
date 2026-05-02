package com.ua.nextflat.controller;

import com.ua.nextflat.model.Usuario;
import com.ua.nextflat.repository.UsuarioRepository;
import com.ua.nextflat.service.UsuarioService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/registro")
    public ResponseEntity<?> registrarUsuario(@RequestBody Usuario nuevoUsuario) {
        try {
            // 1. Comprobar si el email ya existe para que no explote
            if (usuarioRepository.existsByEmail(nuevoUsuario.getEmail())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("El email ya está en uso");
            }
            
            // 2. Guardar el usuario nuevo
            Usuario usuarioGuardado = usuarioRepository.save(nuevoUsuario);
            return ResponseEntity.ok(usuarioGuardado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error en el registro: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> iniciarSesion(@RequestBody Usuario credenciales) {
        try {
            // 1. Buscamos rápido por email sin descargar toda la base de datos
            Optional<Usuario> usuarioEncontrado = usuarioRepository.findByEmail(credenciales.getEmail());

            // 2. Comprobamos contraseña (funcionará perfecto para los que tú registres)
            if (usuarioEncontrado.isPresent() && 
                usuarioEncontrado.get().getPassword().equals(credenciales.getPassword())) {
                
                return ResponseEntity.ok(usuarioEncontrado.get()); // Login correcto
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales incorrectas"); // Fallo
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Usuario> actualizarPerfil(@PathVariable Long id, @RequestBody Usuario datosActualizados) {
        try {
            Optional<Usuario> usuarioExistente = usuarioRepository.findById(id);

            if (usuarioExistente.isPresent()) {
                Usuario usuario = usuarioExistente.get();
                if (datosActualizados.getNombre() != null) {
                    usuario.setNombre(datosActualizados.getNombre());
                }
                if (datosActualizados.getProfesion() != null) {
                    usuario.setProfesion(datosActualizados.getProfesion());
                }
                if (datosActualizados.getFechaNacimiento() != null) {
                    usuario.setFechaNacimiento(datosActualizados.getFechaNacimiento());
                }
                if (datosActualizados.getBio() != null) {
                    usuario.setBio(datosActualizados.getBio());
                }
                if (datosActualizados.getFotoPerfil() != null) {
                    usuario.setFotoPerfil(datosActualizados.getFotoPerfil());
                }

                Usuario usuarioGuardado = usuarioRepository.save(usuario);
                return ResponseEntity.ok(usuarioGuardado);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<?> actualizarPassword(@PathVariable Long id,
            @RequestBody java.util.Map<String, String> passwords) {
        String actual = passwords.get("currentPassword");
        String nueva = passwords.get("newPassword");
        boolean exito = usuarioService.actualizarPassword(id, actual, nueva);

        if (exito) {
            return ResponseEntity.ok().body("Contraseña actualizada correctamente");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("La contraseña actual es incorrecta");
        }
    }

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