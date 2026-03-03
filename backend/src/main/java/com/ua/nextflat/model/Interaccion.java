package com.ua.nextflat.model;

import com.ua.nextflat.model.enums.TipoInteraccion;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "interacciones")
public class Interaccion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario_origen_id", nullable = false)
    private Usuario usuarioOrigen;

    @ManyToOne
    @JoinColumn(name = "inmueble_destino_id")
    private Inmueble inmuebleDestino; 

    @ManyToOne
    @JoinColumn(name = "usuario_id_target")
    private Usuario usuarioTarget; 

    @Enumerated(EnumType.STRING)
    private TipoInteraccion tipo;

    @CreationTimestamp
    private LocalDateTime fecha;
}