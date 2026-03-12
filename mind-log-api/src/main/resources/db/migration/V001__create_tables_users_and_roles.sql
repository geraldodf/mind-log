CREATE TABLE roles
(
    id        SERIAL PRIMARY KEY,
    authority VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE users
(
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    username      VARCHAR(255) NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password      VARCHAR(255),
    auth_provider VARCHAR(50)  NOT NULL DEFAULT 'LOCAL',
    google_id     VARCHAR(255) UNIQUE,
    is_enabled    BOOLEAN               DEFAULT FALSE,
    created_at    TIMESTAMP WITHOUT TIME ZONE,
    is_deleted    BOOLEAN               DEFAULT FALSE
);

CREATE TABLE users_roles
(
    user_fk INTEGER NOT NULL,
    role_fk INTEGER NOT NULL,
    PRIMARY KEY (user_fk, role_fk),
    FOREIGN KEY (user_fk) REFERENCES users (id),
    FOREIGN KEY (role_fk) REFERENCES roles (id)
);

CREATE TABLE password_recover_tokens
(
    id         SERIAL PRIMARY KEY,
    token      VARCHAR(50)              NOT NULL,
    email      VARCHAR(255)             NOT NULL,
    expiration TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

INSERT INTO roles (authority)
VALUES ('ROLE_ADMIN'),
       ('ROLE_USER');

INSERT INTO users (name, username, email, password, is_enabled, created_at)
VALUES ('Geraldo Daroz', 'daroz', 'contato@daroz.dev', '$2a$10$TjnGx4y4dpqohmDEPscnvuhR1NBcWPrFtawnGxwRdw66fnFuwp3me',
        TRUE, NOW()),
       ('Michael Douglas', 'douglas', 'contato@mdouglas.dev',
        '$2a$10$TjnGx4y4dpqohmDEPscnvuhR1NBcWPrFtawnGxwRdw66fnFuwp3me', TRUE, NOW()),
       ('Admin', 'admin', 'admin@admin.dev',
        '$2a$10$TjnGx4y4dpqohmDEPscnvuhR1NBcWPrFtawnGxwRdw66fnFuwp3me', TRUE, NOW()),
       ('Gerfy', 'gerfy', 'gerfy@gerfy.dev',
        '$2a$10$TjnGx4y4dpqohmDEPscnvuhR1NBcWPrFtawnGxwRdw66fnFuwp3me', TRUE, NOW());

INSERT INTO users_roles (user_fk, role_fk)
VALUES (1, 1),
       (1, 2),
       (2, 1),
       (2, 2),
       (3, 1),
       (3, 2),
       (4, 1),
       (4, 2);