-- ═══════════════════════════════════════════════════════════════════════════
-- V1 · Complete MindLog Schema
-- ─────────────────────────────────────────────────────────────────────────
-- Single authoritative migration. Contains the full schema with all fixes
-- (BIGINT keys, ON DELETE CASCADE, proper indexes, nullable user_media_id).
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Extensions ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_trgm;


-- ── roles ─────────────────────────────────────────────────────────────────
CREATE TABLE roles
(
    id        BIGSERIAL PRIMARY KEY,
    authority VARCHAR(100) NOT NULL UNIQUE
);


-- ── users ─────────────────────────────────────────────────────────────────
CREATE TABLE users
(
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    username      VARCHAR(255) NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password      VARCHAR(255),
    auth_provider VARCHAR(50)  NOT NULL DEFAULT 'LOCAL',
    google_id     VARCHAR(255) UNIQUE,
    picture       VARCHAR(500),
    is_enabled    BOOLEAN               DEFAULT FALSE,
    created_at    TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX idx_users_username_trgm ON users USING gin (username gin_trgm_ops);
CREATE INDEX idx_users_name_trgm ON users USING gin (name gin_trgm_ops);


-- ── users_roles ───────────────────────────────────────────────────────────
CREATE TABLE users_roles
(
    user_fk BIGINT NOT NULL,
    role_fk BIGINT NOT NULL,
    PRIMARY KEY (user_fk, role_fk),
    FOREIGN KEY (user_fk) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (role_fk) REFERENCES roles (id)
);


-- ── password_recover_tokens ───────────────────────────────────────────────
CREATE TABLE password_recover_tokens
(
    id         BIGSERIAL PRIMARY KEY,
    token      VARCHAR(50)              NOT NULL,
    email      VARCHAR(255)             NOT NULL,
    expiration TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE UNIQUE INDEX uq_password_recover_tokens_token
    ON password_recover_tokens (token);


-- ── media_types ───────────────────────────────────────────────────────────
CREATE TABLE media_types
(
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    is_system  BOOLEAN      NOT NULL       DEFAULT FALSE,
    user_id    BIGINT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- System-wide names must be unique (case-insensitive)
CREATE UNIQUE INDEX uq_media_types_system_name
    ON media_types (lower(name)) WHERE is_system = TRUE;

-- Per-user custom names must be unique per user (case-insensitive)
CREATE UNIQUE INDEX uq_media_types_user_name
    ON media_types (lower(name), user_id) WHERE is_system = FALSE;


-- ── statuses ──────────────────────────────────────────────────────────────
CREATE TABLE statuses
(
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    is_system  BOOLEAN      NOT NULL       DEFAULT FALSE,
    user_id    BIGINT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX uq_statuses_system_name
    ON statuses (lower(name)) WHERE is_system = TRUE;

CREATE UNIQUE INDEX uq_statuses_user_name
    ON statuses (lower(name), user_id) WHERE is_system = FALSE;


-- ── user_media ────────────────────────────────────────────────────────────
CREATE TABLE user_media
(
    id                BIGSERIAL PRIMARY KEY,
    user_id           BIGINT       NOT NULL,
    title             VARCHAR(255) NOT NULL,
    media_type_id     BIGINT       NOT NULL,
    status_id         BIGINT       NOT NULL,
    rating            SMALLINT CHECK (rating BETWEEN 1 AND 5),
    feeling           VARCHAR(50),
    recommendation    VARCHAR(20) CHECK (recommendation IN ('RECOMMEND', 'NEUTRAL', 'NOT_RECOMMEND')),
    start_date        DATE,
    end_date          DATE,
    next_release_date DATE,
    notes             TEXT,
    review            TEXT,
    visibility        VARCHAR(10)  NOT NULL       DEFAULT 'PRIVATE' CHECK (visibility IN ('PUBLIC', 'PRIVATE')),
    created_at        TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at        TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (media_type_id) REFERENCES media_types (id),
    FOREIGN KEY (status_id) REFERENCES statuses (id)
);

-- Covers the common library query: filter by user_id, sort by updated_at DESC
CREATE INDEX idx_user_media_user_updated ON user_media (user_id, updated_at DESC);
CREATE INDEX idx_user_media_status_id ON user_media (status_id);
CREATE INDEX idx_user_media_media_type_id ON user_media (media_type_id);
CREATE INDEX idx_user_media_next_release_date ON user_media (next_release_date);


-- ── notifications ─────────────────────────────────────────────────────────
-- user_media_id is nullable: null = system/social notification (e.g. follow)
CREATE TABLE notifications
(
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT  NOT NULL,
    user_media_id BIGINT,
    message       TEXT    NOT NULL,
    is_read       BOOLEAN NOT NULL            DEFAULT FALSE,
    created_at    TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (user_media_id) REFERENCES user_media (id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user_id ON notifications (user_id);
-- Composite covers both unread-count and full notification list queries
CREATE INDEX idx_notifications_user_read_date ON notifications (user_id, is_read, created_at DESC);


-- ── follows ───────────────────────────────────────────────────────────────
CREATE TABLE follows
(
    id           BIGSERIAL PRIMARY KEY,
    follower_id  BIGINT NOT NULL,
    following_id BIGINT NOT NULL,
    created_at   TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users (id) ON DELETE CASCADE,
    CHECK (follower_id != following_id)
);

-- Covering indexes: satisfy both the WHERE and ORDER BY in a single scan
CREATE INDEX idx_follows_follower_created ON follows (follower_id, created_at DESC);
CREATE INDEX idx_follows_following_created ON follows (following_id, created_at DESC);


-- ── audit_logs ────────────────────────────────────────────────────────────
CREATE TABLE audit_logs
(
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT,
    action      VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id   BIGINT,
    metadata    TEXT,
    ip_address  VARCHAR(45),
    created_at  TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs (action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at);


-- ═══════════════════════════════════════════════════════════════════════════
-- Seed data
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO roles (authority)
VALUES ('ROLE_ADMIN'),
       ('ROLE_USER');

INSERT INTO users (name, username, email, password, is_enabled, created_at)
VALUES ('Geraldo Daros', 'geraldo.daros', 'contato@daroz.dev',
        '$2a$10$TjnGx4y4dpqohmDEPscnvuhR1NBcWPrFtawnGxwRdw66fnFuwp3me', TRUE, NOW());

INSERT INTO users_roles (user_fk, role_fk)
VALUES (1, 1),
       (1, 2);

-- System media types
INSERT INTO media_types (name, is_system)
VALUES ('Movie', TRUE),
       ('Series', TRUE),
       ('Anime', TRUE),
       ('Book', TRUE),
       ('Game', TRUE),
       ('Podcast', TRUE),
       ('Course', TRUE),
       ('Documentary', TRUE);

-- System statuses
INSERT INTO statuses (name, is_system)
VALUES ('Planned', TRUE),
       ('In Progress', TRUE),
       ('Completed', TRUE),
       ('Paused', TRUE),
       ('Dropped', TRUE);
