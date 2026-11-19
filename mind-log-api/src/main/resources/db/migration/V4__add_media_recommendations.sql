-- AI media recommendations.
-- A batch is one call to the model: it is the cache key (library_hash), the daily-limit counter and the cost log.
CREATE TABLE recommendation_batches
(
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT       NOT NULL,
    library_hash  VARCHAR(64)  NOT NULL,
    model         VARCHAR(100) NOT NULL,
    input_tokens  BIGINT       NOT NULL DEFAULT 0,
    output_tokens BIGINT       NOT NULL DEFAULT 0,
    created_at    TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_recommendation_batches_user_created ON recommendation_batches (user_id, created_at DESC);

-- DISMISSED rows are kept on purpose: they feed the "never suggest again" list.
CREATE TABLE media_recommendations
(
    id            BIGSERIAL PRIMARY KEY,
    batch_id      BIGINT       NOT NULL,
    user_id       BIGINT       NOT NULL,
    title         VARCHAR(100) NOT NULL,
    media_type_id BIGINT       NOT NULL,
    reason        VARCHAR(255) NOT NULL,
    based_on      TEXT,
    status        VARCHAR(20)  NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'ADDED', 'DISMISSED')),
    user_media_id BIGINT,
    created_at    TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (batch_id) REFERENCES recommendation_batches (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (media_type_id) REFERENCES media_types (id) ON DELETE CASCADE,
    FOREIGN KEY (user_media_id) REFERENCES user_media (id) ON DELETE SET NULL
);

CREATE INDEX idx_media_recommendations_user_status ON media_recommendations (user_id, status);
CREATE INDEX idx_media_recommendations_batch ON media_recommendations (batch_id);
