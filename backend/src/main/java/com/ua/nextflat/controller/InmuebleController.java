package com.ua.nextflat.controller;

import com.ua.nextflat.model.FotoInmueble;
import com.ua.nextflat.model.Inmueble;
import com.ua.nextflat.repository.FotoInmuebleRepository;
import com.ua.nextflat.repository.InmuebleRepository;
import com.ua.nextflat.dto.DetalleInmuebleDTO;
import com.ua.nextflat.service.InmuebleService;
import com.ua.nextflat.model.PermisosGestion;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import jakarta.persistence.EntityManager;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/inmuebles")
@CrossOrigin(origins = "http://localhost:5173")
public class InmuebleController {

    @Autowired
    private InmuebleRepository inmuebleRepository;

    @Autowired
    private FotoInmuebleRepository fotoInmuebleRepository;

    @Autowired
    private InmuebleService inmuebleService;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private com.ua.nextflat.repository.PermisosGestionRepository permisosGestionRepository;
    
    @Autowired
    private com.ua.nextflat.repository.UsuarioRepository usuarioRepository;

    @GetMapping("/mis-inmuebles/{propietarioId}")
    public ResponseEntity<List<Inmueble>> getMisInmuebles(@PathVariable Long propietarioId) {
        List<Inmueble> misPisos = inmuebleRepository.findByPropietarioId(propietarioId);

        for (Inmueble piso : misPisos) {
        List<FotoInmueble> fotos = fotoInmuebleRepository.findByInmuebleId(piso.getId());
        if (!fotos.isEmpty()) piso.setFotoPrincipal(fotos.get(0).getUrl());
        
        // Mapear múltiples gestores
        List<com.ua.nextflat.model.PermisosGestion> permisos = permisosGestionRepository.findByInmuebleIdAndActivoTrue(piso.getId());
        List<java.util.Map<String, Object>> listaGestores = new java.util.ArrayList<>();
        for(com.ua.nextflat.model.PermisosGestion p : permisos) {
            listaGestores.add(java.util.Map.of("id", p.getInquilinoGestor().getId(), "nombre", p.getInquilinoGestor().getNombre()));
        }
        piso.setGestores(listaGestores);
    }
        return ResponseEntity.ok(misPisos);
    }

    // EN InmuebleController.java

    @PostMapping("/{id}/delegar")
    public ResponseEntity<?> delegarInmueble(@PathVariable Long id, @RequestBody java.util.Map<String, String> payload) {
        String email = payload.get("email");
        Optional<com.ua.nextflat.model.Usuario> userOpt = usuarioRepository.findByEmail(email);
        
        if(userOpt.isEmpty() || userOpt.get().getRol() != com.ua.nextflat.model.enums.RolUsuario.INQUILINO) {
            return ResponseEntity.badRequest().body("El email no corresponde a un inquilino válido.");
        }

        // 1. Convertirlo en DELEGADO
        com.ua.nextflat.model.Usuario delegado = userOpt.get();
        delegado.setRol(com.ua.nextflat.model.enums.RolUsuario.DELEGADO);
        usuarioRepository.save(delegado);

        // 2. Guardar el permiso
        Inmueble inmueble = inmuebleRepository.findById(id).orElseThrow();
        com.ua.nextflat.model.PermisosGestion permiso = new com.ua.nextflat.model.PermisosGestion();
        permiso.setInmueble(inmueble);
        permiso.setPropietario(inmueble.getPropietario());
        permiso.setInquilinoGestor(delegado);
        permisosGestionRepository.save(permiso);
        
        return ResponseEntity.ok(java.util.Map.of("id", delegado.getId(), "nombre", delegado.getNombre(), "mensaje", "Delegado asignado con éxito"));
    }

    @DeleteMapping("/{id}/delegar/{gestorId}")
    public ResponseEntity<?> quitarGestor(@PathVariable Long id, @PathVariable Long gestorId) {
        permisosGestionRepository.findByInmuebleIdAndInquilinoGestorIdAndActivoTrue(id, gestorId).ifPresent(p -> {
            p.setActivo(false);
            permisosGestionRepository.save(p);
            
            // Devolverle su rol de Inquilino normal
            com.ua.nextflat.model.Usuario exDelegado = p.getInquilinoGestor();
            exDelegado.setRol(com.ua.nextflat.model.enums.RolUsuario.INQUILINO);
            usuarioRepository.save(exDelegado);
        });
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetalleInmuebleDTO> getDetalleInmueble(@PathVariable Long id) {
        DetalleInmuebleDTO detalle = inmuebleService.getDetalleInmueble(id);
        return ResponseEntity.ok(detalle);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Inmueble> actualizarInmueble(@PathVariable Long id,
            @RequestBody Inmueble inmuebleActualizado) {
        Optional<Inmueble> opt = inmuebleRepository.findById(id);
        if (opt.isPresent()) {
            Inmueble existente = opt.get();
            existente.setPrecio(inmuebleActualizado.getPrecio());
            existente.setDireccion(inmuebleActualizado.getDireccion());
            existente.setMunicipio(inmuebleActualizado.getMunicipio());
            existente.setDescripcion(inmuebleActualizado.getDescripcion());
            existente.setNumHabitaciones(inmuebleActualizado.getNumHabitaciones());
            existente.setNumBanos(inmuebleActualizado.getNumBanos());
            existente.setTieneAscensor(inmuebleActualizado.isTieneAscensor());
            existente.setAdmiteMascotas(inmuebleActualizado.isAdmiteMascotas());
            existente.setEsCompartido(inmuebleActualizado.isEsCompartido());

            inmuebleRepository.save(existente);
            return ResponseEntity.ok(existente);
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Inmueble> cambiarEstadoInmueble(@PathVariable Long id) {
        Optional<Inmueble> opt = inmuebleRepository.findById(id);
        if (opt.isPresent()) {
            Inmueble piso = opt.get();
            piso.setActivo(!piso.isActivo());
            inmuebleRepository.save(piso);
            return ResponseEntity.ok(piso);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> eliminarInmueble(@PathVariable Long id) {
        if (inmuebleRepository.existsById(id)) {
            // Delete dependent records using native queries to bypass missing cascade
            // configurations
            entityManager.createNativeQuery("DELETE FROM matches WHERE inmueble_id = :id").setParameter("id", id)
                    .executeUpdate();
            entityManager.createNativeQuery("DELETE FROM interacciones WHERE inmueble_destino_id = :id")
                    .setParameter("id", id).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM permisos_gestion WHERE inmueble_id = :id")
                    .setParameter("id", id).executeUpdate();

            // Delete photos explicitly
            List<FotoInmueble> fotos = fotoInmuebleRepository.findByInmuebleId(id);
            fotoInmuebleRepository.deleteAll(fotos);

            inmuebleRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/fotos")
    public ResponseEntity<List<FotoInmueble>> getFotosInmueble(@PathVariable Long id) {
        List<FotoInmueble> fotos = fotoInmuebleRepository.findByInmuebleId(id);
        return ResponseEntity.ok(fotos);
    }

    @PostMapping("/{id}/fotos")
    public ResponseEntity<FotoInmueble> agregarFotoInmueble(@PathVariable Long id, @RequestBody FotoInmueble foto) {
        Optional<Inmueble> opt = inmuebleRepository.findById(id);
        if (opt.isPresent()) {
            foto.setInmueble(opt.get());
            FotoInmueble fotoGuardada = fotoInmuebleRepository.save(foto);
            return ResponseEntity.ok(fotoGuardada);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{inmuebleId}/fotos/{fotoId}")
    public ResponseEntity<Void> eliminarFoto(@PathVariable Long inmuebleId, @PathVariable Long fotoId) {
        Optional<FotoInmueble> fotoOpt = fotoInmuebleRepository.findById(fotoId);
        if (fotoOpt.isPresent()) {
            FotoInmueble foto = fotoOpt.get();
            if (foto.getInmueble().getId().equals(inmuebleId)) {
                fotoInmuebleRepository.deleteById(fotoId);
                return ResponseEntity.noContent().build();
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Inmueble> crearInmueble(@RequestBody Inmueble nuevoInmueble) {
        // Guarda el nuevo inmueble en la base de datos
        Inmueble guardado = inmuebleRepository.save(nuevoInmueble);
        return ResponseEntity.ok(guardado);
    }
}