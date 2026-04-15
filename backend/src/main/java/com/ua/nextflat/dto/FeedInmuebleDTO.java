package com.ua.nextflat.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
public class FeedInmuebleDTO {
    private Long id;
    private BigDecimal precio;
    private String municipio;
    private String direccion;
    private Integer numHabitaciones;
    private Integer numBanos;
    private List<String> fotos; 
}