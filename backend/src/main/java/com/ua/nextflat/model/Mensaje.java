package com.ua.nextflat.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "mensajes")
public class Mensaje {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "chat_id", nullable = false)
    private Chat chat;

    @ManyToOne
    @JoinColumn(name = "emisor_id", nullable = false)
    private Usuario emisor;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String contenido;

    private boolean leido = false;

    @CreationTimestamp
    private LocalDateTime fecha;
}