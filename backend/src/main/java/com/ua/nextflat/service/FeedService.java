package com.ua.nextflat.service;

import com.ua.nextflat.dto.FeedInmuebleDTO;
import com.ua.nextflat.dto.SwipeRequestDTO;
import com.ua.nextflat.model.FotoInmueble;
import com.ua.nextflat.model.Inmueble;
import com.ua.nextflat.model.Interaccion;
import com.ua.nextflat.model.Usuario;
import com.ua.nextflat.repository.FotoInmuebleRepository;
import com.ua.nextflat.repository.InmuebleRepository;
import com.ua.nextflat.repository.InteraccionRepository;
import com.ua.nextflat.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
public class FeedService {

    private final InmuebleRepository inmuebleRepository;
    private final InteraccionRepository interaccionRepository;
    private final FotoInmuebleRepository fotoInmuebleRepository;
    private final UsuarioRepository usuarioRepository;

    @Autowired
    public FeedService(InmuebleRepository inmuebleRepository,
            InteraccionRepository interaccionRepository,
            FotoInmuebleRepository fotoInmuebleRepository,
            UsuarioRepository usuarioRepository) {
        this.inmuebleRepository = inmuebleRepository;
        this.interaccionRepository = interaccionRepository;
        this.fotoInmuebleRepository = fotoInmuebleRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<FeedInmuebleDTO> getFeedForUser(Long usuarioId, String municipio, Double precioMax) {
        String municipioDB = (municipio != null && !municipio.trim().isEmpty()) ? municipio.trim().toLowerCase() : null;

        List<Inmueble> inmuebles = inmuebleRepository.findFeedForUser(usuarioId, municipioDB, precioMax);

        return inmuebles.stream().map(inmueble -> {
            FeedInmuebleDTO dto = new FeedInmuebleDTO();
            dto.setId(inmueble.getId());
            dto.setPrecio(inmueble.getPrecio());
            dto.setMunicipio(inmueble.getMunicipio());
            dto.setDireccion(inmueble.getDireccion());
            dto.setNumHabitaciones(inmueble.getNumHabitaciones());
            dto.setNumBanos(inmueble.getNumBanos());

            List<String> urls = fotoInmuebleRepository
                    .findByInmuebleId(inmueble.getId())
                    .stream()
                    .map(FotoInmueble::getUrl)
                    .collect(Collectors.toList());
            dto.setFotos(urls);

            return dto;
        }).collect(Collectors.toList());
    }

    public void processSwipe(SwipeRequestDTO request) {
        Usuario usuarioOrigen = usuarioRepository.findById(request.getUsuarioOrigenId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Usuario no encontrado con ID: " + request.getUsuarioOrigenId()));

        Inmueble inmuebleDestino = inmuebleRepository.findById(request.getInmuebleDestinoId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Inmueble no encontrado con ID: " + request.getInmuebleDestinoId()));

        Interaccion interaccion = new Interaccion();
        interaccion.setUsuarioOrigen(usuarioOrigen);
        interaccion.setInmuebleDestino(inmuebleDestino);
        // We set target owner of the property
        interaccion.setUsuarioTarget(inmuebleDestino.getPropietario());
        interaccion.setTipo(request.getTipoInteraccion());

        interaccionRepository.save(interaccion);
    }

    @org.springframework.transaction.annotation.Transactional
    public FeedInmuebleDTO rewindLastSwipe(Long usuarioId) {
        Optional<Interaccion> ultimaInteraccionOpt = interaccionRepository
                .findFirstByUsuarioOrigenIdOrderByFechaDesc(usuarioId);

        if (ultimaInteraccionOpt.isEmpty()) {
            throw new IllegalStateException("No hay interacciones para deshacer.");
        }

        Interaccion ultima = ultimaInteraccionOpt.get();

        if ("LIKE".equals(ultima.getTipo().name())) {
            throw new IllegalStateException("Solo puedes deshacer los rechazos (DISLIKE).");
        }

        interaccionRepository.delete(ultima);

        Inmueble inmueble = ultima.getInmuebleDestino();
        FeedInmuebleDTO dto = new FeedInmuebleDTO();
        dto.setId(inmueble.getId());
        dto.setPrecio(inmueble.getPrecio());
        dto.setMunicipio(inmueble.getMunicipio());
        dto.setDireccion(inmueble.getDireccion());
        dto.setNumHabitaciones(inmueble.getNumHabitaciones());
        dto.setNumBanos(inmueble.getNumBanos());

        List<String> urls = fotoInmuebleRepository
                .findByInmuebleId(inmueble.getId())
                .stream()
                .map(FotoInmueble::getUrl)
                .collect(Collectors.toList());
        dto.setFotos(urls);

        return dto;
    }

    @org.springframework.transaction.annotation.Transactional
    public Usuario rewindLastCandidatoSwipe(Long propietarioId) {
        Optional<Interaccion> ultimaInteraccionOpt = interaccionRepository
                .findFirstByUsuarioOrigenIdOrderByFechaDesc(propietarioId);

        if (ultimaInteraccionOpt.isEmpty()) {
            throw new IllegalStateException("No hay interacciones para deshacer.");
        }

        Interaccion ultima = ultimaInteraccionOpt.get();

        if ("LIKE".equals(ultima.getTipo().name())) {
            throw new IllegalStateException("Solo puedes deshacer los rechazos (DISLIKE).");
        }

        interaccionRepository.delete(ultima);

        return ultima.getUsuarioTarget();
    }
}
