package com.ua.nextflat.service;

import com.ua.nextflat.model.Usuario;
import com.ua.nextflat.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public boolean actualizarPassword(Long id, String passwordActual, String passwordNueva) {
        Usuario usuario = usuarioRepository.findById(id).orElse(null);

        if (usuario != null && usuario.getPassword().equals(passwordActual)) {
            usuario.setPassword(passwordNueva);
            usuarioRepository.save(usuario);
            return true;
        }
        return false;
    }
}
