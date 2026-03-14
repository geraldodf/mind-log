package com.mindlog.services.audit;

import com.mindlog.data.models.AuditLog;
import com.mindlog.repositories.AuditLogRepository;
import com.mindlog.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository repository;
    private final UserRepository userRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String action, String entityType, Long entityId, String metadata, String ipAddress) {
        try {
            AuditLog audit = new AuditLog();
            audit.setAction(action);
            audit.setEntityType(entityType);
            audit.setEntityId(entityId);
            audit.setMetadata(metadata);
            audit.setIpAddress(ipAddress);
            audit.setCreatedAt(Instant.now());

            String username = SecurityContextHolder.getContext().getAuthentication() != null
                    ? SecurityContextHolder.getContext().getAuthentication().getName()
                    : null;
            if (username != null && !username.equals("anonymousUser")) {
                userRepository.findUserByUsername(username).ifPresent(audit::setUser);
            }

            repository.save(audit);
        } catch (Exception e) {
            log.warn("Failed to write audit log for action={}: {}", action, e.getMessage());
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String action, String entityType, Long entityId) {
        log(action, entityType, entityId, null, null);
    }
}
