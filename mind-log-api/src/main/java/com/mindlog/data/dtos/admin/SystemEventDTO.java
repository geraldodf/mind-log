package com.mindlog.data.dtos.admin;

import java.time.Instant;

public record SystemEventDTO(Long id, String eventType, String username, Instant createdAt) {}
