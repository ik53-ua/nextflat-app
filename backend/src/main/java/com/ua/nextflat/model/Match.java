package com.ua.nextflat.model;

import com.ua.nextflat.model.enums.EstadoMatch;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "matches")
public class Match {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "inquilino_id")
    private Usuario inquilino;

    @ManyToOne
    @JoinColumn(name = "propietario_id", nullable = false)
    private Usuario propietario;

    @ManyToOne
    @JoinColumn(name = "inmueble_id", nullable = false)
    private Inmueble inmueble;

    @Enumerated(EnumType.STRING)
    private EstadoMatch estado = EstadoMatch.CONFIRMADO; // [cite: 90]

    @CreationTimestamp
    private LocalDateTime fechaMatch;

    private boolean activo = true;
}