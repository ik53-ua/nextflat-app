package com.ua.nextflat.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
public class DetalleInmuebleDTO {
    private Long id;
    private BigDecimal precio;
    private String direccion;
    private String municipio;
    private Double latitud;
    private Double longitud;
    private String descripcion;
    private Integer numHabitaciones;
    private Integer numBanos;
    private boolean tieneAscensor;
    private boolean admiteMascotas;
    private boolean esCompartido;
    private List<String> fotos;
    
    // Propietario info
    private String propietarioNombre;
    private String propietarioFoto;
    private String propietarioBio;
}
