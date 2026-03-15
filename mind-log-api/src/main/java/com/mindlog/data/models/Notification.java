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

    /**
     * For social notifications (e.g. follow events): the username of the actor.
     * Null for media-release notifications that have no associated user action.
     */
    @Column(name = "related_username")
    private String relatedUsername;

    /** Display name of the social actor (e.g. the follower's full name). */
    @Column(name = "related_name")
    private String relatedName;

    /** Machine-readable type used by the frontend to build translated messages.
     *  Values: FOLLOW, MEDIA_RELEASE_TODAY, MEDIA_RELEASE_SOON */
    @Column(name = "notification_type")
    private String notificationType;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private Boolean isRead = false;

    private Instant createdAt;
}
