package com.ua.nextflat.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MensajeDTO {
    private Long id;
    private Long chatId;
    private Long emisorId;
    private String contenido;
    private boolean leido;
    private LocalDateTime fecha;
}
