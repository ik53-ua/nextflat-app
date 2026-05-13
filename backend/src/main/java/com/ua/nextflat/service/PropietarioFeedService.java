package com.ua.nextflat.service;

import com.ua.nextflat.dto.CandidatoFeedDTO;
import com.ua.nextflat.dto.SwipeCandidatoRequestDTO;
import com.ua.nextflat.model.Interaccion;
import com.ua.nextflat.model.Usuario;
import com.ua.nextflat.repository.InteraccionRepository;
import com.ua.nextflat.repository.UsuarioRepository;
import com.ua.nextflat.repository.PermisosGestionRepository;
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
    private final PermisosGestionRepository permisosGestionRepository; // Inyección añadida

    @Autowired
    public PropietarioFeedService(InteraccionRepository interaccionRepository,
                                  UsuarioRepository usuarioRepository,
                                  com.ua.nextflat.repository.MatchRepository matchRepository,
                                  com.ua.nextflat.repository.ChatRepository chatRepository,
                                  PermisosGestionRepository permisosGestionRepository) { // Inyección añadida
        this.interaccionRepository = interaccionRepository;
        this.usuarioRepository = usuarioRepository;
        this.matchRepository = matchRepository;
        this.chatRepository = chatRepository;
        this.permisosGestionRepository = permisosGestionRepository;
    }

    /**
     * US-008 / US-014: Devuelve candidatos. Si pertenecen a un grupo, los empaqueta juntos.
     */
    public List<CandidatoFeedDTO> getCandidatosParaPropietario(Long propietarioId) {
        List<Usuario> candidatos = interaccionRepository.findCandidatosParaPropietario(propietarioId);
        
        List<CandidatoFeedDTO> result = new ArrayList<>();
        Set<Long> gruposProcesados = new HashSet<>(); 

        for (Usuario candidato : candidatos) {
            CandidatoFeedDTO dto = new CandidatoFeedDTO();
            
            // --- LÓGICA US-014: PACK 2x1 ---
            if (candidato.getGrupo() != null) {
                Long grupoId = candidato.getGrupo().getId();
                
                if (gruposProcesados.contains(grupoId)) continue;
                gruposProcesados.add(grupoId);

                List<Usuario> miembros = usuarioRepository.findByGrupoId(grupoId);
                
                dto.setId(candidato.getId()); 
                dto.setEsGrupo(true);
                dto.setBio(candidato.getBio()); 
                
                List<CandidatoFeedDTO.UsuarioGrupoDTO> usuariosGrupo = new ArrayList<>();
                for (Usuario miembro : miembros) {
                    CandidatoFeedDTO.UsuarioGrupoDTO miniDto = new CandidatoFeedDTO.UsuarioGrupoDTO();
                    miniDto.setId(miembro.getId());
                    miniDto.setNombre(miembro.getNombre());
                    miniDto.setFotoPerfil(miembro.getFotoPerfil());
                    miniDto.setProfesion(miembro.getProfesion());
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

            List<Interaccion> likes = interaccionRepository
                    .findLikesDeCandidatoEnPisosDelPropietario(candidato.getId(), propietarioId);

            if (!likes.isEmpty()) {
                Interaccion likeReciente = likes.get(0);
                if (likeReciente.getInmuebleDestino() != null) {
                    dto.setInteresadoEnDireccion(likeReciente.getInmuebleDestino().getDireccion());
                    dto.setInteresadoEnMunicipio(likeReciente.getInmuebleDestino().getMunicipio());
                    dto.setInmuebleInteresadoId(likeReciente.getInmuebleDestino().getId());
                }
                dto.setEsSuperLike(likeReciente.isEsSuperLike());
            }

            result.add(dto);
        }
        
        result.sort((a, b) -> Boolean.compare(b.isEsSuperLike(), a.isEsSuperLike()));

        return result;
    }

    /**
     * US-014 / US-015: Swipe Atómico y Lógica de Delegados
     */
    public void processSwipePropietario(SwipeCandidatoRequestDTO request) {
        Usuario propietario = usuarioRepository.findById(request.getPropietarioId())
                .orElseThrow(() -> new IllegalArgumentException("Propietario no encontrado"));

        Usuario candidatoPrincipal = usuarioRepository.findById(request.getCandidatoId())
                .orElseThrow(() -> new IllegalArgumentException("Candidato no encontrado"));

        List<Usuario> usuariosAfectados = new ArrayList<>();
        if (candidatoPrincipal.getGrupo() != null) {
            usuariosAfectados.addAll(usuarioRepository.findByGrupoId(candidatoPrincipal.getGrupo().getId()));
        } else {
            usuariosAfectados.add(candidatoPrincipal); 
        }

        // Recuperar el inmueble que le gustó al candidato originalmente
        List<Interaccion> likesAnteriores = interaccionRepository
                .findLikesDeCandidatoEnPisosDelPropietario(candidatoPrincipal.getId(), propietario.getId());
        com.ua.nextflat.model.Inmueble inmuebleVinculado = likesAnteriores.isEmpty() ? null : likesAnteriores.get(0).getInmuebleDestino();

        Usuario realPropietario = propietario; 

        // Si el que está haciendo Swipe es un DELEGADO
        if (propietario.getRol() == com.ua.nextflat.model.enums.RolUsuario.DELEGADO) {
            com.ua.nextflat.model.PermisosGestion permiso = permisosGestionRepository
                .findByInquilinoGestorIdAndActivoTrue(propietario.getId())
                .stream().findFirst().orElseThrow(() -> new IllegalStateException("Delegado sin permisos activos"));
            
            realPropietario = permiso.getPropietario();
            inmuebleVinculado = permiso.getInmueble();
        }

        // 1. APLICAR LA INTERACCIÓN A TODOS (Para que no vuelvan a salir en el feed)
        for (Usuario afectado : usuariosAfectados) {
            Interaccion interaccion = new Interaccion();
            interaccion.setUsuarioOrigen(realPropietario); // El Match siempre es a nombre del dueño real
            interaccion.setUsuarioTarget(afectado);
            interaccion.setInmuebleDestino(null);
            interaccion.setTipo(request.getTipoInteraccion());
            interaccionRepository.save(interaccion);
        }

        // 2. CREAR EL MATCH Y CHAT (UNA SOLA VEZ, FUERA DEL BUCLE)
        if (request.getTipoInteraccion() == com.ua.nextflat.model.enums.TipoInteraccion.LIKE && inmuebleVinculado != null) {
            
            com.ua.nextflat.model.Match nuevoMatch = new com.ua.nextflat.model.Match();
            nuevoMatch.setPropietario(realPropietario);
            nuevoMatch.setInquilino(candidatoPrincipal); // SOLO 1 MATCH REPRESENTATIVO
            nuevoMatch.setInmueble(inmuebleVinculado);
            com.ua.nextflat.model.Match savedMatch = matchRepository.save(nuevoMatch);

            com.ua.nextflat.model.Chat nuevoChat = new com.ua.nextflat.model.Chat();
            nuevoChat.setMatchVinculado(savedMatch);
            
            boolean esGrupo = candidatoPrincipal.getGrupo() != null;
            boolean esDelegado = propietario.getRol() == com.ua.nextflat.model.enums.RolUsuario.DELEGADO;

            if (esDelegado && esGrupo) {
                nuevoChat.setNombreGrupo("Chat Grupal (Delegado): " + inmuebleVinculado.getDireccion());
                nuevoChat.setEsGrupal(true); 
            } else if (esDelegado) {
                nuevoChat.setNombreGrupo("Chat (Delegado): " + inmuebleVinculado.getDireccion());
                nuevoChat.setEsGrupal(true); 
            } else if (esGrupo) {
                nuevoChat.setNombreGrupo("Chat Grupal: " + inmuebleVinculado.getDireccion());
                nuevoChat.setEsGrupal(true);
            } else {
                nuevoChat.setNombreGrupo("Chat: " + inmuebleVinculado.getDireccion());
                nuevoChat.setEsGrupal(false); 
            }
            chatRepository.save(nuevoChat);
        }
    }
}