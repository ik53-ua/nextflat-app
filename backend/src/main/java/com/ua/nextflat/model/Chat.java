package com.ua.nextflat.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "chats")
public class Chat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "match_vinculado_id", nullable = false)
    private Match matchVinculado;

    private String nombreGrupo;
    private boolean esGrupal = false;

    @CreationTimestamp
    private LocalDateTime fechaCreacion;
}