package com.ua.nextflat.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "permisos_gestion")
public class PermisosGestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "propietario_id", nullable = false)
    private Usuario propietario;

    @ManyToOne
    @JoinColumn(name = "inquilino_gestor_id", nullable = false)
    private Usuario inquilinoGestor;

    @ManyToOne
    @JoinColumn(name = "inmueble_id", nullable = false)
    private Inmueble inmueble;

    private boolean activo = true;

    @CreationTimestamp
    private LocalDateTime createdAt;
}