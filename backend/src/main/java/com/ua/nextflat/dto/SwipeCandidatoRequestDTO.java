package com.ua.nextflat.dto;

import com.ua.nextflat.model.enums.TipoInteraccion;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SwipeCandidatoRequestDTO {
    private Long propietarioId;
    private Long candidatoId;
    private TipoInteraccion tipoInteraccion; // LIKE | DISLIKE
}
