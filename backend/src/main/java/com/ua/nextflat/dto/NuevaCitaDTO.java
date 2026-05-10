package com.ua.nextflat.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NuevaCitaDTO {
    private Long propietarioId;
    private Long inquilinoId;
    private Long inmuebleId; 
    private Long creadorId; 
    private LocalDateTime fechaHora;
    private String motivo;
    private String notas;
}
