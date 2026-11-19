package com.mindlog.data.models;

import com.mindlog.data.converters.NewlineListConverter;
import com.mindlog.data.enums.RecommendationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "media_recommendations")
public class MediaRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private RecommendationBatch batch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "media_type_id", nullable = false)
    private MediaType mediaType;

    @Column(nullable = false)
    private String reason;

    @Convert(converter = NewlineListConverter.class)
    @Column(name = "based_on", columnDefinition = "TEXT")
    private List<String> basedOn = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecommendationStatus status = RecommendationStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_media_id")
    private UserMedia userMedia;

    @CreationTimestamp
    private Instant createdAt;
}
