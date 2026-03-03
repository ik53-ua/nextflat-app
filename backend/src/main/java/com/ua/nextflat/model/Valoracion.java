package com.ua.nextflat.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "valoraciones")
public class Valoracion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "autor_id", nullable = false)
    private Usuario autor;

    @ManyToOne
    @JoinColumn(name = "destino_id", nullable = false)
    private Usuario destino;

    private Integer puntuacion;

    @Column(columnDefinition = "TEXT")
    private String comentario;

    @CreationTimestamp
    private LocalDateTime fecha;
}
