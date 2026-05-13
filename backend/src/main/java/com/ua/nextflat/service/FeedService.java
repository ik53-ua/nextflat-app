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
import com.ua.nextflat.dto.CandidatoFeedDTO;
import java.time.LocalDate;
import java.time.Period;
import com.ua.nextflat.repository.PermisosGestionRepository;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
public class FeedService {

    private final PermisosGestionRepository permisosGestionRepository;
    private final InmuebleRepository inmuebleRepository;
    private final InteraccionRepository interaccionRepository;
    private final FotoInmuebleRepository fotoInmuebleRepository;
    private final UsuarioRepository usuarioRepository;

    @Autowired
    public FeedService(InmuebleRepository inmuebleRepository,
            InteraccionRepository interaccionRepository,
            FotoInmuebleRepository fotoInmuebleRepository,
            UsuarioRepository usuarioRepository,
            PermisosGestionRepository permisosGestionRepository) {
        this.inmuebleRepository = inmuebleRepository;
        this.interaccionRepository = interaccionRepository;
        this.fotoInmuebleRepository = fotoInmuebleRepository;
        this.usuarioRepository = usuarioRepository;
        this.permisosGestionRepository = permisosGestionRepository;
    }

    public List<FeedInmuebleDTO> getFeedForUser(Long usuarioId, String municipio, java.math.BigDecimal precioMin, java.math.BigDecimal precioMax, 
                                                Integer numHabitaciones, Integer numBanos, Boolean tieneAscensor, 
                                                Boolean admiteMascotas, Boolean esCompartido) {
        String municipioDB = (municipio != null && !municipio.trim().isEmpty()) ? municipio.trim().toLowerCase() : null;
        
        List<Long> usuariosIds = null;

        if (usuarioId != null) {
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
                    
            usuariosIds = new java.util.ArrayList<>();
            usuariosIds.add(usuarioId);
            
            // Si tiene grupo, añadimos también a sus compañeros
            if (usuario.getGrupo() != null) {
                List<Usuario> miembros = usuarioRepository.findByGrupoId(usuario.getGrupo().getId());
                for (Usuario m : miembros) {
                    if (!usuariosIds.contains(m.getId())) {
                        usuariosIds.add(m.getId());
                    }
                }
            }
        }

        List<Inmueble> inmuebles = inmuebleRepository.findFeedForUser(usuariosIds, municipioDB, precioMin, precioMax, 
                numHabitaciones, numBanos, tieneAscensor, admiteMascotas, esCompartido);

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
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Inmueble inmuebleDestino = inmuebleRepository.findById(request.getInmuebleDestinoId())
                .orElseThrow(() -> new IllegalArgumentException("Inmueble no encontrado"));

        // COMPROBACIÓN DE LÍMITE DE SUPER LIKES
        if (request.isEsSuperLike()) {
            if (usuarioOrigen.getSuperLikesRestantes() <= 0) {
                throw new IllegalStateException("Has agotado tus 5 Super Likes diarios.");
            }
            // Le restamos uno y guardamos
            usuarioOrigen.setSuperLikesRestantes(usuarioOrigen.getSuperLikesRestantes() - 1);
            usuarioRepository.save(usuarioOrigen);
        }

        Interaccion interaccion = new Interaccion();
        interaccion.setUsuarioOrigen(usuarioOrigen);
        interaccion.setInmuebleDestino(inmuebleDestino);
        interaccion.setUsuarioTarget(inmuebleDestino.getPropietario());
        interaccion.setTipo(request.getTipoInteraccion());
        interaccion.setEsSuperLike(request.isEsSuperLike());

        interaccionRepository.save(interaccion);
    }

    @org.springframework.transaction.annotation.Transactional
    public FeedInmuebleDTO rewindLastSwipe(Long usuarioId) {
        // 1. Verificar si el usuario puede hacer Rewind
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        if (!usuario.isEsPremium()) {
            if (usuario.getRewindsRestantes() <= 0) {
                throw new IllegalStateException("Has agotado tus usos diarios para deshacer. ¡Pásate a Premium para usos ilimitados!");
            }
            // Descontar un rewind
            usuario.setRewindsRestantes(usuario.getRewindsRestantes() - 1);
            usuarioRepository.save(usuario);
        }

        // 2. Lógica existente...
        Optional<Interaccion> ultimaInteraccionOpt = interaccionRepository
                .findFirstByUsuarioOrigenIdOrderByFechaDesc(usuarioId);

        if (ultimaInteraccionOpt.isEmpty()) {
            // Si falla, le devolvemos el rewind que le acabamos de quitar
            if (!usuario.isEsPremium()) {
                usuario.setRewindsRestantes(usuario.getRewindsRestantes() + 1);
                usuarioRepository.save(usuario);
            }
            throw new IllegalStateException("No hay interacciones para deshacer.");
        }

        Interaccion ultima = ultimaInteraccionOpt.get();

        if ("LIKE".equals(ultima.getTipo().name())) {
            if (!usuario.isEsPremium()) {
                usuario.setRewindsRestantes(usuario.getRewindsRestantes() + 1);
                usuarioRepository.save(usuario);
            }
            throw new IllegalStateException("Solo puedes deshacer los rechazos (DISLIKE).");
        }

        interaccionRepository.delete(ultima);

        // ... El resto del método se queda igual (creación del DTO y return)
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
    public CandidatoFeedDTO rewindLastCandidatoSwipe(Long propietarioId) {
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

        Usuario candidato = ultima.getUsuarioTarget();
        Inmueble inmueble = ultima.getInmuebleDestino();

        // 2. Cndidato
        CandidatoFeedDTO dto = new CandidatoFeedDTO();
        dto.setId(candidato.getId());
        dto.setNombre(candidato.getNombre());
        dto.setProfesion(candidato.getProfesion());
        dto.setFotoPerfil(candidato.getFotoPerfil());
        dto.setBio(candidato.getBio());

        if (candidato.getFechaNacimiento() != null) {
            dto.setEdad(Period.between(candidato.getFechaNacimiento(), LocalDate.now()).getYears());
        }

        if (inmueble != null) {
            dto.setInteresadoEnDireccion(inmueble.getDireccion());
            dto.setInteresadoEnMunicipio(inmueble.getMunicipio());
            dto.setInmuebleInteresadoId(inmueble.getId());
        }

        // 2. Grupos
        if (candidato.getGrupo() != null) {
            dto.setEsGrupo(true);
            List<Usuario> miembros = usuarioRepository.findByGrupoId(candidato.getGrupo().getId());
            List<CandidatoFeedDTO.UsuarioGrupoDTO> usuariosGrupo = miembros.stream().map(m -> {
                CandidatoFeedDTO.UsuarioGrupoDTO uDto = new CandidatoFeedDTO.UsuarioGrupoDTO();
                uDto.setId(m.getId());
                uDto.setNombre(m.getNombre());
                if (m.getFechaNacimiento() != null) {
                    uDto.setEdad(Period.between(m.getFechaNacimiento(), LocalDate.now()).getYears());
                }
                uDto.setFotoPerfil(m.getFotoPerfil());
                return uDto;
            }).collect(Collectors.toList());
            dto.setUsuarios(usuariosGrupo);
        }

        return dto;
    }

    public List<FeedInmuebleDTO> getPublicFeed() {
        List<Inmueble> inmuebles = inmuebleRepository.findRandomPublicFlats();
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
}
