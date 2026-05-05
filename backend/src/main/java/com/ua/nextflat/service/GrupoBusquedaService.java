package com.ua.nextflat.service;

import com.ua.nextflat.model.GrupoBusqueda;
import com.ua.nextflat.model.Usuario;
import com.ua.nextflat.repository.GrupoBusquedaRepository;
import com.ua.nextflat.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Random;

@Service
public class GrupoBusquedaService {

    private final GrupoBusquedaRepository grupoBusquedaRepository;
    private final UsuarioRepository usuarioRepository;

    @Autowired
    public GrupoBusquedaService(GrupoBusquedaRepository grupoBusquedaRepository, UsuarioRepository usuarioRepository) {
        this.grupoBusquedaRepository = grupoBusquedaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public Usuario crearGrupoParaUsuario(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado."));

        if (usuario.getGrupo() != null) {
            throw new IllegalStateException("Ya perteneces a un grupo de búsqueda activo.");
        }

        String codigo;
        do {
            codigo = generarCodigoUnico();
        } while (grupoBusquedaRepository.existsByCodigoInvitacion(codigo));

        GrupoBusqueda grupo = new GrupoBusqueda();
        grupo.setCodigoInvitacion(codigo);
        grupo.setNombre("Grupo de " + usuario.getNombre());
        grupo = grupoBusquedaRepository.save(grupo);

        usuario.setGrupo(grupo);
        return usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario abandonarGrupo(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado."));

        usuario.setGrupo(null);
        return usuarioRepository.save(usuario);
    }

    private String generarCodigoUnico() {
        String caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random rnd = new Random();
        StringBuilder sb = new StringBuilder("NX-");
        for (int i = 0; i < 4; i++) {
            sb.append(caracteres.charAt(rnd.nextInt(caracteres.length())));
        }
        return sb.toString();
    }

    @Transactional
    public Usuario unirseAGrupo(Long usuarioId, String codigoInvitacion) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado."));

        if (usuario.getGrupo() != null) {
            throw new IllegalStateException("Ya perteneces a un grupo de búsqueda activo.");
        }

        GrupoBusqueda grupo = grupoBusquedaRepository.findByCodigoInvitacion(codigoInvitacion.toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Código inválido o caducado"));

        usuario.setGrupo(grupo);
        return usuarioRepository.save(usuario);
    }

    public java.util.List<String> obtenerNombresMiembros(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado."));

        if (usuario.getGrupo() == null) {
            return java.util.Collections.emptyList();
        }

        return usuarioRepository.findByGrupoId(usuario.getGrupo().getId())
                .stream()
                .filter(u -> !u.getId().equals(usuarioId))
                .map(Usuario::getNombre)
                .collect(java.util.stream.Collectors.toList());
    }
}