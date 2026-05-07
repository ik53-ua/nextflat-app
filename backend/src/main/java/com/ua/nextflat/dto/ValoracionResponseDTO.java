package com.ua.nextflat.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ValoracionResponseDTO {
    private Long id;
    private Long autorId;
    private String autorNombre;
    private String autorFoto;
    private Integer puntuacion;
    private String comentario;
    private LocalDateTime fecha;
}