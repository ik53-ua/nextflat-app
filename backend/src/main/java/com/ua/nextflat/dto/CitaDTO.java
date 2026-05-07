package com.ua.nextflat.dto;

import com.ua.nextflat.model.enums.EstadoCita;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CitaDTO {
    private Long id;
    private Long propietarioId;
    private String propietarioNombre;
    private Long inquilinoId;
    private String inquilinoNombre;
    private Long inmuebleId;
    private String inmuebleDireccion;
    private LocalDateTime fechaHora;
    private EstadoCita estado;
    private String motivo;
    private String notas;
}
