package com.ua.nextflat.service;

import com.ua.nextflat.dto.ValoracionDTO;
import com.ua.nextflat.dto.ValoracionResponseDTO;
import com.ua.nextflat.model.Usuario;
import com.ua.nextflat.model.Valoracion;
import com.ua.nextflat.repository.MatchRepository;
import com.ua.nextflat.repository.UsuarioRepository;
import com.ua.nextflat.repository.ValoracionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ValoracionService {

    private final ValoracionRepository valoracionRepository;
    private final UsuarioRepository usuarioRepository;
    private final MatchRepository matchRepository;

    @Autowired
    public ValoracionService(ValoracionRepository valoracionRepository,
            UsuarioRepository usuarioRepository,
            MatchRepository matchRepository) {
        this.valoracionRepository = valoracionRepository;
        this.usuarioRepository = usuarioRepository;
        this.matchRepository = matchRepository;
    }

    // Crear valoración

    @Transactional
    public ValoracionResponseDTO crearValoracion(ValoracionDTO dto) {

        // 1. Validar que autor y destino existen
        Usuario autor = usuarioRepository.findById(dto.getAutorId())
                .orElseThrow(() -> new IllegalArgumentException("Autor no encontrado"));
        Usuario destino = usuarioRepository.findById(dto.getDestinoId())
                .orElseThrow(() -> new IllegalArgumentException("Usuario destino no encontrado"));

        // 2. Un usuario no puede valorarse a sí mismo
        if (dto.getAutorId().equals(dto.getDestinoId())) {
            throw new IllegalArgumentException("No puedes valorarte a ti mismo");
        }

        // 3. Comprobar que existe un Match previo entre ambos
        boolean tienenMatch = matchRepository.countMatchBetweenUsers(dto.getAutorId(), dto.getDestinoId()) > 0;
        if (!tienenMatch) {
            throw new IllegalStateException("Solo puedes valorar a usuarios con los que has hecho Match");
        }

        // 4. Evitar valoración duplicada
        if (valoracionRepository.findByAutorIdAndDestinoId(dto.getAutorId(), dto.getDestinoId()).isPresent()) {
            throw new IllegalStateException("Ya has valorado a este usuario");
        }

        // 5. Validar puntuación 1-5
        if (dto.getPuntuacion() == null || dto.getPuntuacion() < 1 || dto.getPuntuacion() > 5) {
            throw new IllegalArgumentException("La puntuación debe estar entre 1 y 5");
        }

        // 6. Persistir
        Valoracion valoracion = new Valoracion();
        valoracion.setAutor(autor);
        valoracion.setDestino(destino);
        valoracion.setPuntuacion(dto.getPuntuacion());
        valoracion.setComentario(dto.getComentario());

        return toDTO(valoracionRepository.save(valoracion));
    }

    // Listar valoraciones recibidas por un usuario

    public List<ValoracionResponseDTO> getValoracionesByDestino(Long destinoId) {
        return valoracionRepository.findByDestinoIdOrderByFechaDesc(destinoId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Stats: media + número de reseñas

    public Map<String, Object> getStatsValoracion(Long destinoId) {
        Double media = valoracionRepository.calcularMedia(destinoId);
        Long total = valoracionRepository.contarValoraciones(destinoId);

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("media", media != null ? Math.round(media * 10.0) / 10.0 : null);
        stats.put("total", total);
        return stats;
    }

    // Comprobar si el usuario ya valoró al destino

    public boolean yaValorado(Long autorId, Long destinoId) {
        return valoracionRepository.findByAutorIdAndDestinoId(autorId, destinoId).isPresent();
    }

    // Mapper

    private ValoracionResponseDTO toDTO(Valoracion v) {
        ValoracionResponseDTO dto = new ValoracionResponseDTO();
        dto.setId(v.getId());
        dto.setAutorId(v.getAutor().getId());
        dto.setAutorNombre(v.getAutor().getNombre());
        dto.setAutorFoto(v.getAutor().getFotoPerfil());
        dto.setPuntuacion(v.getPuntuacion());
        dto.setComentario(v.getComentario());
        dto.setFecha(v.getFecha());
        return dto;
    }
}