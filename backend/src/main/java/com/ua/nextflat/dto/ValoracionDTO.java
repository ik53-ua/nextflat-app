package com.ua.nextflat.dto;

import lombok.Data;

@Data
public class ValoracionDTO {
    private Long autorId;
    private Long destinoId;
    private Integer puntuacion;
    private String comentario;
}