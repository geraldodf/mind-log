package com.mindlog.data.dtos.audit;
import java.time.Instant;
public record AuditLogDTO(Long id, Long userId, String username, String action, String entityType, Long entityId, String metadata, String ipAddress, Instant createdAt) {}
