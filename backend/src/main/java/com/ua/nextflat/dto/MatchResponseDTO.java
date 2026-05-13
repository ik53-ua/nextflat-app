package com.ua.nextflat.dto;

import java.time.LocalDateTime;
import java.util.List;

public class MatchResponseDTO {
    private Long matchId;
    private Long contactoId;
    private String nombreContacto;
    private String imagenContacto;
    private String subtitulo;
    private LocalDateTime fechaMatch;
    
    // Lista de participantes para los avatares solapados
    private List<ParticipanteDTO> participantes;

    // --- GETTERS Y SETTERS ---
    public Long getMatchId() { return matchId; }
    public void setMatchId(Long matchId) { this.matchId = matchId; }
    
    public Long getContactoId() { return contactoId; }
    public void setContactoId(Long contactoId) { this.contactoId = contactoId; }
    
    public String getNombreContacto() { return nombreContacto; }
    public void setNombreContacto(String nombreContacto) { this.nombreContacto = nombreContacto; }
    
    public String getImagenContacto() { return imagenContacto; }
    public void setImagenContacto(String imagenContacto) { this.imagenContacto = imagenContacto; }
    
    public String getSubtitulo() { return subtitulo; }
    public void setSubtitulo(String subtitulo) { this.subtitulo = subtitulo; }
    
    public LocalDateTime getFechaMatch() { return fechaMatch; }
    public void setFechaMatch(LocalDateTime fechaMatch) { this.fechaMatch = fechaMatch; }
    
    public List<ParticipanteDTO> getParticipantes() { return participantes; }
    public void setParticipantes(List<ParticipanteDTO> participantes) { this.participantes = participantes; }

    // --- SUB-CLASE PARA LOS AVATARES ---
    public static class ParticipanteDTO {
        private Long id;
        private String nombre;
        private String fotoPerfil;

        public ParticipanteDTO(Long id, String nombre, String fotoPerfil) {
            this.id = id;
            this.nombre = nombre;
            this.fotoPerfil = fotoPerfil;
        }

        public Long getId() { return id; }
        public String getNombre() { return nombre; }
        public String getFotoPerfil() { return fotoPerfil; }
    }
}