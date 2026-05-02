package com.ua.nextflat.service;

import com.ua.nextflat.model.Chat;
import com.ua.nextflat.model.Match;
import com.ua.nextflat.model.Mensaje;
import com.ua.nextflat.model.Usuario;
import com.ua.nextflat.repository.ChatRepository;
import com.ua.nextflat.repository.MensajeRepository;
import com.ua.nextflat.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {

    private final ChatRepository chatRepository;
    private final MensajeRepository mensajeRepository;
    private final UsuarioRepository usuarioRepository;

    @Autowired
    public ChatService(ChatRepository chatRepository, MensajeRepository mensajeRepository, UsuarioRepository usuarioRepository) {
        this.chatRepository = chatRepository;
        this.mensajeRepository = mensajeRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public Chat getChatForMatch(Long matchId) {
        return chatRepository.findByMatchVinculadoId(matchId)
                .orElseThrow(() -> new IllegalArgumentException("Chat no encontrado para el match: " + matchId));
    }

    public List<Mensaje> getMensajesForChat(Long chatId) {
        return mensajeRepository.findByChatIdOrderByFechaAsc(chatId);
    }

    public Mensaje enviarMensaje(Long chatId, Long emisorId, String contenido) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new IllegalArgumentException("Chat no encontrado"));
        Usuario emisor = usuarioRepository.findById(emisorId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Mensaje mensaje = new Mensaje();
        mensaje.setChat(chat);
        mensaje.setEmisor(emisor);
        mensaje.setContenido(contenido);
        mensaje.setLeido(false);

        return mensajeRepository.save(mensaje);
    }
}
