package com.ua.nextflat.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

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

    private boolean esSuperLike = false;

    // --- NUEVOS CAMPOS PARA US-014 (GRUPOS) ---
    private boolean esGrupo = false;
    private List<UsuarioGrupoDTO> usuarios;

    /**
     * Clase interna para mandar los datos mínimos de cada 
     * miembro del grupo a la tarjeta de React.
     */
    @Data
    @NoArgsConstructor
    public static class UsuarioGrupoDTO {
        private Long id;
        private String nombre;
        private Integer edad;
        private String fotoPerfil;
    }

}