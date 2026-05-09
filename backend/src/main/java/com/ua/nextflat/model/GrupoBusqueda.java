package com.ua.nextflat.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@Entity
@Table(name = "grupos_busqueda")
public class GrupoBusqueda {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, length = 20)
    private String codigoInvitacion;

    private String nombre;

    @CreationTimestamp
    private LocalDateTime createdAt;
}