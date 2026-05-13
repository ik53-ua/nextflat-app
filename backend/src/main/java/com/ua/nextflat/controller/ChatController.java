package com.ua.nextflat.controller;

import com.ua.nextflat.dto.ChatDTO;
import com.ua.nextflat.dto.EnvioMensajeDTO;
import com.ua.nextflat.dto.MensajeDTO;
import com.ua.nextflat.model.Chat;
import com.ua.nextflat.model.Mensaje;
import com.ua.nextflat.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chats")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    private final ChatService chatService;

    @Autowired
    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping("/match/{matchId}")
    public ResponseEntity<ChatDTO> getChatForMatch(@PathVariable Long matchId) {
        Chat chat = chatService.getChatForMatch(matchId);
        ChatDTO dto = new ChatDTO();
        dto.setId(chat.getId());
        dto.setMatchId(chat.getMatchVinculado().getId());
        dto.setInmuebleId(chat.getMatchVinculado().getInmueble().getId());
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{chatId}/mensajes")
    public ResponseEntity<List<MensajeDTO>> getMensajes(@PathVariable Long chatId) {
        List<Mensaje> mensajes = chatService.getMensajesForChat(chatId);
        List<MensajeDTO> dtos = mensajes.stream().map(m -> {
            MensajeDTO dto = new MensajeDTO();
            dto.setId(m.getId());
            dto.setChatId(m.getChat().getId());
            dto.setEmisorId(m.getEmisor().getId());
            dto.setContenido(m.getContenido());
            dto.setLeido(m.isLeido());
            dto.setFecha(m.getFecha());
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/{chatId}/mensajes")
    public ResponseEntity<MensajeDTO> enviarMensaje(@PathVariable Long chatId, @RequestBody EnvioMensajeDTO request) {
        Mensaje m = chatService.enviarMensaje(chatId, request.getEmisorId(), request.getContenido());
        MensajeDTO dto = new MensajeDTO();
        dto.setId(m.getId());
        dto.setChatId(m.getChat().getId());
        dto.setEmisorId(m.getEmisor().getId());
        dto.setContenido(m.getContenido());
        dto.setLeido(m.isLeido());
        dto.setFecha(m.getFecha());
        return ResponseEntity.ok(dto);
    }
}
