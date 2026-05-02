package com.ua.nextflat.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CandidatoFeedDTO {
    private Long id;
    private String nombre;
    private Integer edad;
    private String profesion;
    private String fotoPerfil;
    private String bio;
    // Contexto: el piso al que dio Like este candidato
    private String interesadoEnDireccion;
    private String interesadoEnMunicipio;
    private Long inmuebleInteresadoId;
}
