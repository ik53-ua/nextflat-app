package com.ua.nextflat.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "inmuebles")
public class Inmueble {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "propietario_id", nullable = false)
    private Usuario propietario; 

    @Column(nullable = false)
    private BigDecimal precio;

    @Column(nullable = false)
    private String direccion;

    @Column(nullable = false)
    private String municipio;

    private Double latitud;
    private Double longitud;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    private Integer numHabitaciones;
    private Integer numBanos;
    
    private boolean tieneAscensor = false;
    private boolean admiteMascotas = false;
    private boolean esCompartido = false; 
    private boolean activo = true;

    @CreationTimestamp
    private LocalDateTime createdAt;
    @Transient
    private String fotoPrincipal;

    @Transient
    private java.util.List<java.util.Map<String, Object>> gestores;

}