package com.ua.nextflat.model;

import com.ua.nextflat.model.enums.EstadoCita;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "citas")
public class Cita {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "propietario_id", nullable = false)
    private Usuario propietario;

    @ManyToOne
    @JoinColumn(name = "inquilino_id", nullable = false)
    private Usuario inquilino;

    @ManyToOne
    @JoinColumn(name = "inmueble_id")
    private Inmueble inmueble;

    private Long creadorId;
    private Boolean ocultoPropietario = false;
    private Boolean ocultoInquilino = false;

    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoCita estado = EstadoCita.PENDIENTE;

    @Column(length = 500)
    private String motivo;

    @Column(length = 1000)
    private String notas;

    @CreationTimestamp
    private LocalDateTime fechaCreacion;
}
