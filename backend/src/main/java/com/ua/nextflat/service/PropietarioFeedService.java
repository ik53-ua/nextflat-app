package com.ua.nextflat.service;

import com.ua.nextflat.dto.CandidatoFeedDTO;
import com.ua.nextflat.dto.SwipeCandidatoRequestDTO;
import com.ua.nextflat.model.Interaccion;
import com.ua.nextflat.model.Usuario;
import com.ua.nextflat.repository.InteraccionRepository;
import com.ua.nextflat.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class PropietarioFeedService {

    private final InteraccionRepository interaccionRepository;
    private final UsuarioRepository usuarioRepository;
    private final com.ua.nextflat.repository.MatchRepository matchRepository;
    private final com.ua.nextflat.repository.ChatRepository chatRepository;

    @Autowired
    public PropietarioFeedService(InteraccionRepository interaccionRepository,
                                  UsuarioRepository usuarioRepository,
                                  com.ua.nextflat.repository.MatchRepository matchRepository,
                                  com.ua.nextflat.repository.ChatRepository chatRepository) {
        this.interaccionRepository = interaccionRepository;
        this.usuarioRepository = usuarioRepository;
        this.matchRepository = matchRepository;
        this.chatRepository = chatRepository;
    }

    /**
     * US-008 / US-014: Devuelve candidatos. Si pertenecen a un grupo, los empaqueta juntos.
     */
    public List<CandidatoFeedDTO> getCandidatosParaPropietario(Long propietarioId) {
        List<Usuario> candidatos = interaccionRepository.findCandidatosParaPropietario(propietarioId);
        
        List<CandidatoFeedDTO> result = new ArrayList<>();
        Set<Long> gruposProcesados = new HashSet<>(); // Para no meter el mismo grupo dos veces

        for (Usuario candidato : candidatos) {
            CandidatoFeedDTO dto = new CandidatoFeedDTO();
            
            // --- LÓGICA US-014: PACK 2x1 ---
            if (candidato.getGrupo() != null) {
                Long grupoId = candidato.getGrupo().getId();
                
                // Si ya empaquetamos a este grupo por el otro compañero, lo saltamos
                if (gruposProcesados.contains(grupoId)) continue;
                gruposProcesados.add(grupoId);

                // Buscamos a todos los miembros de este grupo
                List<Usuario> miembros = usuarioRepository.findByGrupoId(grupoId);
                
                dto.setId(candidato.getId()); // Usamos el ID del primero para el Swipe
                dto.setEsGrupo(true);
                dto.setBio(candidato.getBio()); // Usamos la bio del que dio Like
                
                List<CandidatoFeedDTO.UsuarioGrupoDTO> usuariosGrupo = new ArrayList<>();
                for (Usuario miembro : miembros) {
                    CandidatoFeedDTO.UsuarioGrupoDTO miniDto = new CandidatoFeedDTO.UsuarioGrupoDTO();
                    miniDto.setId(miembro.getId());
                    miniDto.setNombre(miembro.getNombre());
                    miniDto.setFotoPerfil(miembro.getFotoPerfil());
                    if (miembro.getFechaNacimiento() != null) {
                        miniDto.setEdad(Period.between(miembro.getFechaNacimiento(), LocalDate.now()).getYears());
                    }
                    usuariosGrupo.add(miniDto);
                }
                dto.setUsuarios(usuariosGrupo);

            } else {
                // --- LÓGICA INDIVIDUAL NORMAL ---
                dto.setId(candidato.getId());
                dto.setNombre(candidato.getNombre());
                dto.setProfesion(candidato.getProfesion());
                dto.setFotoPerfil(candidato.getFotoPerfil());
                dto.setBio(candidato.getBio());
                if (candidato.getFechaNacimiento() != null) {
                    dto.setEdad(Period.between(candidato.getFechaNacimiento(), LocalDate.now()).getYears());
                }
            }

            // Recuperar el piso al que dio Like (el más reciente)
            List<Interaccion> likes = interaccionRepository
                    .findLikesDeCandidatoEnPisosDelPropietario(candidato.getId(), propietarioId);

            if (!likes.isEmpty()) {
                Interaccion likeReciente = likes.get(0);
                if (likeReciente.getInmuebleDestino() != null) {
                    dto.setInteresadoEnDireccion(likeReciente.getInmuebleDestino().getDireccion());
                    dto.setInteresadoEnMunicipio(likeReciente.getInmuebleDestino().getMunicipio());
                    dto.setInmuebleInteresadoId(likeReciente.getInmuebleDestino().getId());
                }
            }

            result.add(dto);
        }
        return result;
    }

    /**
     * US-014: Swipe Atómico. Aplica el LIKE/DISLIKE a todos los miembros del grupo.
     */
    public void processSwipePropietario(SwipeCandidatoRequestDTO request) {
        Usuario propietario = usuarioRepository.findById(request.getPropietarioId())
                .orElseThrow(() -> new IllegalArgumentException("Propietario no encontrado"));

        Usuario candidatoPrincipal = usuarioRepository.findById(request.getCandidatoId())
                .orElseThrow(() -> new IllegalArgumentException("Candidato no encontrado"));

        // --- LÓGICA US-014: OBTENER A TODOS LOS AFECTADOS ---
        List<Usuario> usuariosAfectados = new ArrayList<>();
        if (candidatoPrincipal.getGrupo() != null) {
            usuariosAfectados.addAll(usuarioRepository.findByGrupoId(candidatoPrincipal.getGrupo().getId()));
        } else {
            usuariosAfectados.add(candidatoPrincipal); // Va solo
        }

        // Recuperar el inmueble que le gustó al candidato originalmente (para hacer el Match)
        List<Interaccion> likesAnteriores = interaccionRepository
                .findLikesDeCandidatoEnPisosDelPropietario(candidatoPrincipal.getId(), propietario.getId());
        com.ua.nextflat.model.Inmueble inmuebleVinculado = likesAnteriores.isEmpty() ? null : likesAnteriores.get(0).getInmuebleDestino();

        // Aplicar la acción a TODOS simultáneamente
        for (Usuario afectado : usuariosAfectados) {
            
            // 1. Guardar Interacción
            Interaccion interaccion = new Interaccion();
            interaccion.setUsuarioOrigen(propietario);
            interaccion.setUsuarioTarget(afectado);
            interaccion.setInmuebleDestino(null);
            interaccion.setTipo(request.getTipoInteraccion());
            interaccionRepository.save(interaccion);

            // 2. Si es LIKE, generar Match y Chat para cada uno
            if (request.getTipoInteraccion() == com.ua.nextflat.model.enums.TipoInteraccion.LIKE && inmuebleVinculado != null) {
                
                com.ua.nextflat.model.Match nuevoMatch = new com.ua.nextflat.model.Match();
                nuevoMatch.setPropietario(propietario);
                nuevoMatch.setInquilino(afectado);
                nuevoMatch.setInmueble(inmuebleVinculado);
                com.ua.nextflat.model.Match savedMatch = matchRepository.save(nuevoMatch);

                com.ua.nextflat.model.Chat nuevoChat = new com.ua.nextflat.model.Chat();
                nuevoChat.setMatchVinculado(savedMatch);
                nuevoChat.setNombreGrupo("Chat: " + inmuebleVinculado.getDireccion());
                nuevoChat.setEsGrupal(false); // Podría ser true en el futuro si soportáis chats grupales
                chatRepository.save(nuevoChat);
            }
        }
    }
}