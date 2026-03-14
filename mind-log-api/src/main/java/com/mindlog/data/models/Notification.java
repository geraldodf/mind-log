package com.mindlog.data.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Optional link to a media entry. Null for non-media notifications
     * (e.g. "X started following you", system announcements).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_media_id", nullable = true)
    private UserMedia userMedia;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private Boolean isRead = false;

    private Instant createdAt;
}
