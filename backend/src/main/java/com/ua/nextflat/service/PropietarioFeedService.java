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
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PropietarioFeedService {

    private final InteraccionRepository interaccionRepository;
    private final UsuarioRepository usuarioRepository;

    @Autowired
    public PropietarioFeedService(InteraccionRepository interaccionRepository,
                                  UsuarioRepository usuarioRepository) {
        this.interaccionRepository = interaccionRepository;
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * US-008: Devuelve los candidatos (inquilinos) que dieron LIKE a algún piso
     * del propietario dado, y que el propietario aún no ha evaluado.
     */
    public List<CandidatoFeedDTO> getCandidatosParaPropietario(Long propietarioId) {
        List<Usuario> candidatos = interaccionRepository.findCandidatosParaPropietario(propietarioId);

        return candidatos.stream().map(candidato -> {
            CandidatoFeedDTO dto = new CandidatoFeedDTO();
            dto.setId(candidato.getId());
            dto.setNombre(candidato.getNombre());
            dto.setProfesion(candidato.getProfesion());
            dto.setFotoPerfil(candidato.getFotoPerfil());
            dto.setBio(candidato.getBio());

            // Calcular edad a partir de fechaNacimiento
            if (candidato.getFechaNacimiento() != null) {
                int edad = Period.between(candidato.getFechaNacimiento(), LocalDate.now()).getYears();
                dto.setEdad(edad);
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

            return dto;
        }).collect(Collectors.toList());
    }

    /**
     * US-008: Registra el swipe del propietario sobre un candidato.
     * Crea una Interaccion donde:
     *   - usuarioOrigen  = propietario
     *   - usuarioTarget  = candidato (inquilino)
     *   - inmuebleDestino = null (evaluación de persona, no de piso)
     *   - tipo           = LIKE | DISLIKE
     */
    public void processSwipePropietario(SwipeCandidatoRequestDTO request) {
        Usuario propietario = usuarioRepository.findById(request.getPropietarioId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Propietario no encontrado con ID: " + request.getPropietarioId()));

        Usuario candidato = usuarioRepository.findById(request.getCandidatoId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Candidato no encontrado con ID: " + request.getCandidatoId()));

        Interaccion interaccion = new Interaccion();
        interaccion.setUsuarioOrigen(propietario);
        interaccion.setUsuarioTarget(candidato);
        interaccion.setInmuebleDestino(null); // swipe de persona, no de piso
        interaccion.setTipo(request.getTipoInteraccion());

        interaccionRepository.save(interaccion);
    }
}
