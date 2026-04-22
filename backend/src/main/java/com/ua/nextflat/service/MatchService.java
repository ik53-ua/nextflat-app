package com.ua.nextflat.service;

import com.ua.nextflat.dto.MatchResponseDTO;
import com.ua.nextflat.model.Match;
import com.ua.nextflat.model.enums.RolUsuario;
import com.ua.nextflat.repository.FotoInmuebleRepository;
import com.ua.nextflat.repository.MatchRepository;
import com.ua.nextflat.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MatchService {

    private final MatchRepository matchRepository;
    private final UsuarioRepository usuarioRepository;
    private final FotoInmuebleRepository fotoInmuebleRepository;

    @Autowired
    public MatchService(MatchRepository matchRepository,
                        UsuarioRepository usuarioRepository,
                        FotoInmuebleRepository fotoInmuebleRepository) {
        this.matchRepository = matchRepository;
        this.usuarioRepository = usuarioRepository;
        this.fotoInmuebleRepository = fotoInmuebleRepository;
    }

    public List<MatchResponseDTO> getMatchesForUser(Long userId) {
        // Obtener el rol del usuario
        RolUsuario rol = usuarioRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado: " + userId))
                .getRol();

        List<Match> matches = matchRepository.findActiveMatchesByUserId(userId);

        return matches.stream().map(match -> {
            MatchResponseDTO dto = new MatchResponseDTO();
            dto.setMatchId(match.getId());
            dto.setFechaMatch(match.getFechaMatch());

            if (rol == RolUsuario.PROPIETARIO) {
                // El propietario ve los datos del inquilino
                dto.setContactoId(match.getInquilino().getId());
                dto.setNombreContacto(match.getInquilino().getNombre());
                dto.setImagenContacto(match.getInquilino().getFotoPerfil());
                dto.setSubtitulo(match.getInmueble().getDireccion());
            } else {
                // El inquilino ve los datos del inmueble
                dto.setContactoId(match.getPropietario().getId());
                dto.setNombreContacto(match.getInmueble().getDireccion());
                // Primera foto del inmueble si existe, si no null
                fotoInmuebleRepository.findByInmuebleId(match.getInmueble().getId())
                        .stream()
                        .findFirst()
                        .ifPresent(foto -> dto.setImagenContacto(foto.getUrl()));
                dto.setSubtitulo(match.getInmueble().getMunicipio());
            }

            return dto;
        }).collect(Collectors.toList());
    }
}