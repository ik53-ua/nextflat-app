package com.ua.nextflat.dto;

import com.ua.nextflat.model.enums.TipoInteraccion;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SwipeRequestDTO {
    private Long usuarioOrigenId;
    private Long inmuebleDestinoId;
    private TipoInteraccion tipoInteraccion;
    private boolean esSuperLike = false;
}
