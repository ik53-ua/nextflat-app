package com.ua.nextflat.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "fotos_inmueble")
public class FotoInmueble {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "inmueble_id", nullable = false)
    private Inmueble inmueble;

    @Column(nullable = false)
    private String url;
}