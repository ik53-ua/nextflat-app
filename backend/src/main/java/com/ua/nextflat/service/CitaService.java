package com.ua.nextflat.service;

import com.ua.nextflat.dto.CitaDTO;
import com.ua.nextflat.dto.NuevaCitaDTO;
import com.ua.nextflat.model.Cita;
import com.ua.nextflat.model.Inmueble;
import com.ua.nextflat.model.Usuario;
import com.ua.nextflat.model.enums.EstadoCita;
import com.ua.nextflat.model.enums.RolUsuario;
import com.ua.nextflat.repository.CitaRepository;
import com.ua.nextflat.repository.InmuebleRepository;
import com.ua.nextflat.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CitaService {

    @Autowired
    private CitaRepository citaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private InmuebleRepository inmuebleRepository;

    @Autowired
    private com.ua.nextflat.repository.PermisosGestionRepository permisosGestionRepository;

    public CitaDTO crearCita(NuevaCitaDTO request) {
        Usuario propietario = usuarioRepository.findById(request.getPropietarioId())
                .orElseThrow(() -> new IllegalArgumentException("Propietario no encontrado"));
                
        Usuario inquilino = usuarioRepository.findById(request.getInquilinoId())
                .orElseThrow(() -> new IllegalArgumentException("Inquilino no encontrado"));
                
        Inmueble inmueble = null;
        if (request.getInmuebleId() != null) {
            inmueble = inmuebleRepository.findById(request.getInmuebleId())
                    .orElse(null);
        }

        Cita cita = new Cita();
        cita.setPropietario(propietario);
        cita.setInquilino(inquilino);
        cita.setInmueble(inmueble);
        cita.setCreadorId(request.getCreadorId());
        cita.setFechaHora(request.getFechaHora());
        cita.setMotivo(request.getMotivo());
        cita.setNotas(request.getNotas());
        cita.setEstado(EstadoCita.PENDIENTE);

        Cita savedCita = citaRepository.save(cita);
        return mapToDTO(savedCita);
    }

    public List<CitaDTO> obtenerCitasUsuario(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
                
        if (usuario.getRol() == RolUsuario.PROPIETARIO) {
            List<Cita> citas = citaRepository.findByPropietarioIdOrderByFechaHoraAsc(usuarioId);
            return citas.stream()
                .filter(c -> c.getOcultoPropietario() == null || !c.getOcultoPropietario())
                .map(this::mapToDTO)
                .collect(Collectors.toList());
                
        } else if (usuario.getRol() == RolUsuario.INQUILINO) {
            List<Cita> citas;
            if (usuario.getGrupo() != null) {
                // Si está en grupo, carga las citas de CUALQUIERA del grupo
                List<Usuario> miembros = usuarioRepository.findByGrupoId(usuario.getGrupo().getId());
                List<Long> memberIds = miembros.stream().map(Usuario::getId).collect(Collectors.toList());
                citas = citaRepository.findByInquilinoIdInOrderByFechaHoraAsc(memberIds);
            } else {
                citas = citaRepository.findByInquilinoIdOrderByFechaHoraAsc(usuarioId);
            }
            
            return citas.stream()
                .filter(c -> c.getOcultoInquilino() == null || !c.getOcultoInquilino())
                .map(this::mapToDTO)
                .collect(Collectors.toList());
                
        } else if (usuario.getRol() == RolUsuario.DELEGADO) {
            // El delegado ve las citas de sus inmuebles asignados
            List<com.ua.nextflat.model.PermisosGestion> permisos = 
                permisosGestionRepository.findByInquilinoGestorIdAndActivoTrue(usuarioId);
                
            return permisos.stream()
                .flatMap(p -> citaRepository.findByInmuebleIdOrderByFechaHoraAsc(p.getInmueble().getId()).stream())
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        } else {
            return List.of();
        }
    }

    public void ocultarCitaParaUsuario(Long citaId, Long usuarioId) {
        Cita cita = citaRepository.findById(citaId)
                .orElseThrow(() -> new IllegalArgumentException("Cita no encontrada"));
        
        if (cita.getPropietario().getId().equals(usuarioId)) {
            cita.setOcultoPropietario(true);
        } else if (cita.getInquilino().getId().equals(usuarioId)) {
            cita.setOcultoInquilino(true);
        }
        citaRepository.save(cita);
    }

    public CitaDTO actualizarEstadoCita(Long citaId, EstadoCita nuevoEstado) {
        Cita cita = citaRepository.findById(citaId)
                .orElseThrow(() -> new IllegalArgumentException("Cita no encontrada"));
        cita.setEstado(nuevoEstado);
        Cita updatedCita = citaRepository.save(cita);
        return mapToDTO(updatedCita);
    }

    private CitaDTO mapToDTO(Cita cita) {
        CitaDTO dto = new CitaDTO();
        dto.setId(cita.getId());
        dto.setPropietarioId(cita.getPropietario().getId());
        dto.setPropietarioNombre(cita.getPropietario().getNombre());
        dto.setInquilinoId(cita.getInquilino().getId());
        dto.setInquilinoNombre(cita.getInquilino().getNombre());
        if (cita.getInmueble() != null) {
            dto.setInmuebleId(cita.getInmueble().getId());
            dto.setInmuebleDireccion(cita.getInmueble().getDireccion());
        }
        dto.setCreadorId(cita.getCreadorId());
        dto.setFechaHora(cita.getFechaHora());
        dto.setEstado(cita.getEstado());
        dto.setMotivo(cita.getMotivo());
        dto.setNotas(cita.getNotas());
        return dto;
    }
}