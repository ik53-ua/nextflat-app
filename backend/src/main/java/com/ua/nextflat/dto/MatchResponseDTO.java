package com.ua.nextflat.dto;

import java.time.LocalDateTime;

public class MatchResponseDTO {
    private Long matchId;
    private Long contactoId;
    private String nombreContacto;
    private String imagenContacto;
    private String subtitulo;
    private LocalDateTime fechaMatch;

    // Getters y Setters
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
}