package com.ua.nextflat.model;

import com.ua.nextflat.model.enums.EstadoVerificacion;
import com.ua.nextflat.model.enums.RolUsuario;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

@Data
@Entity
@Table(name = "usuarios")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RolUsuario rol;

    private String fotoPerfil;
    private String profesion;
    private LocalDate fechaNacimiento;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_verificacion")
    private EstadoVerificacion estadoVerificacion = EstadoVerificacion.NO_VERIFICADO;
    
    // Campo legado mantenido para no romper la BD en Supabase (evitar el error NOT NULL)
    private boolean verificado = false;
    private String documentoVerificacionUrl;

    @ManyToOne
    @JoinColumn(name = "grupo_id")
    private GrupoBusqueda grupo;

    @CreationTimestamp
    private LocalDateTime createdAt;
}