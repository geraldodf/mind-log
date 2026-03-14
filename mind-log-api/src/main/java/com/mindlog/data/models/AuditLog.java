package com.mindlog.data.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Getter @Setter @AllArgsConstructor @NoArgsConstructor
@Entity @Table(name = "audit_logs")
public class AuditLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String action;

    private String entityType;
    private Long entityId;

    @Column(columnDefinition = "TEXT")
    private String metadata;

    private String ipAddress;
    private Instant createdAt;
}
