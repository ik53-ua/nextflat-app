package com.ua.nextflat.service;

import com.ua.nextflat.dto.MatchResponseDTO;
import com.ua.nextflat.model.Match;
import com.ua.nextflat.model.PermisosGestion;
import com.ua.nextflat.model.Usuario;
import com.ua.nextflat.model.enums.RolUsuario;
import com.ua.nextflat.repository.FotoInmuebleRepository;
import com.ua.nextflat.repository.MatchRepository;
import com.ua.nextflat.repository.PermisosGestionRepository;
import com.ua.nextflat.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MatchService {

    private final MatchRepository matchRepository;
    private final UsuarioRepository usuarioRepository;
    private final FotoInmuebleRepository fotoInmuebleRepository;
    private final PermisosGestionRepository permisosGestionRepository; // AÑADIDO

    @Autowired
    public MatchService(MatchRepository matchRepository,
                        UsuarioRepository usuarioRepository,
                        FotoInmuebleRepository fotoInmuebleRepository,
                        PermisosGestionRepository permisosGestionRepository) {
        this.matchRepository = matchRepository;
        this.usuarioRepository = usuarioRepository;
        this.fotoInmuebleRepository = fotoInmuebleRepository;
        this.permisosGestionRepository = permisosGestionRepository;
    }

    public List<MatchResponseDTO> getMatchesForUser(Long userId) {
        RolUsuario rol = usuarioRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado: " + userId))
                .getRol();

        List<Match> matches = matchRepository.findActiveMatchesByUserId(userId);

        return matches.stream().map(match -> {
            MatchResponseDTO dto = new MatchResponseDTO();
            dto.setMatchId(match.getId());
            dto.setFechaMatch(match.getFechaMatch());

            List<MatchResponseDTO.ParticipanteDTO> participantes = new ArrayList<>();
            
            // Buscar si este piso tiene un delegado activo
            Optional<PermisosGestion> permiso = permisosGestionRepository
                    .findByInmuebleIdAndActivoTrue(match.getInmueble().getId()).stream().findFirst();
            Usuario delegado = permiso.map(PermisosGestion::getInquilinoGestor).orElse(null);

            Usuario inquilinoPrincipal = match.getInquilino();
            List<Usuario> inquilinos = new ArrayList<>();
            if (inquilinoPrincipal.getGrupo() != null) {
                inquilinos.addAll(usuarioRepository.findByGrupoId(inquilinoPrincipal.getGrupo().getId()));
            } else {
                inquilinos.add(inquilinoPrincipal);
            }

            if (rol == RolUsuario.PROPIETARIO || rol == RolUsuario.DELEGADO) {
                for (Usuario inq : inquilinos) {
                    participantes.add(new MatchResponseDTO.ParticipanteDTO(inq.getId(), inq.getNombre(), inq.getFotoPerfil()));
                }
                if (rol == RolUsuario.PROPIETARIO && delegado != null) {
                    participantes.add(new MatchResponseDTO.ParticipanteDTO(delegado.getId(), delegado.getNombre() + " (Delegado)", delegado.getFotoPerfil()));
                } else if (rol == RolUsuario.DELEGADO) {
                    participantes.add(new MatchResponseDTO.ParticipanteDTO(match.getPropietario().getId(), match.getPropietario().getNombre() + " (Propietario)", match.getPropietario().getFotoPerfil()));
                }
                dto.setContactoId(inquilinos.get(0).getId());
                dto.setImagenContacto(inquilinos.get(0).getFotoPerfil());
                dto.setSubtitulo(match.getInmueble().getDireccion());
                
            } else { // INQUILINO NORMAL (Ve al Propietario, Delegado y Compis)
                participantes.add(new MatchResponseDTO.ParticipanteDTO(match.getPropietario().getId(), match.getPropietario().getNombre(), match.getPropietario().getFotoPerfil()));
                if (delegado != null) {
                    participantes.add(new MatchResponseDTO.ParticipanteDTO(delegado.getId(), delegado.getNombre() + " (Delegado)", delegado.getFotoPerfil()));
                }
                for (Usuario inq : inquilinos) {
                    if (!inq.getId().equals(userId)) {
                        participantes.add(new MatchResponseDTO.ParticipanteDTO(inq.getId(), inq.getNombre() + " (Compi)", inq.getFotoPerfil()));
                    }
                }
                dto.setContactoId(match.getPropietario().getId());
                dto.setSubtitulo(match.getInmueble().getMunicipio());
                
                fotoInmuebleRepository.findByInmuebleId(match.getInmueble().getId())
                        .stream().findFirst().ifPresent(foto -> dto.setImagenContacto(foto.getUrl()));
            }

            // Unimos los nombres separados por coma para el título principal
            dto.setNombreContacto(participantes.stream().map(MatchResponseDTO.ParticipanteDTO::getNombre).collect(Collectors.joining(", ")));
            dto.setParticipantes(participantes);

            return dto;
        }).collect(Collectors.toList());
    }
}