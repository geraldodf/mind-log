package com.mindlog.data.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

/** Uma chamada ao modelo: chave de cache, contador do limite diário e registro de custo. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "recommendation_batches")
public class RecommendationBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 64)
    private String libraryHash;

    @Column(nullable = false, length = 100)
    private String model;

    @Column(nullable = false)
    private Long inputTokens = 0L;

    @Column(nullable = false)
    private Long outputTokens = 0L;

    @CreationTimestamp
    private Instant createdAt;
}
