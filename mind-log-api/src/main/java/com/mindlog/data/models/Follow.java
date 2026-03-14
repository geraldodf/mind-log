package com.mindlog.data.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor
@Entity @Table(name = "follows")
public class Follow {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "follower_id", nullable = false)
    private User follower;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "following_id", nullable = false)
    private User following;

    private Instant createdAt;
}
