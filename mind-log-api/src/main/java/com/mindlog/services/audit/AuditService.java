package com.mindlog.services.audit;

import com.mindlog.data.models.SystemEvent;
import com.mindlog.repositories.SystemEventRepository;
import com.mindlog.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Logs critical system-level events only.
 * Tracked events: ACCOUNT_CREATED, ACCOUNT_DELETED.
 * Does NOT track individual user actions (media edits, follows, etc.).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {

    private final SystemEventRepository repository;
    private final UserRepository userRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String eventType) {
        try {
            SystemEvent event = new SystemEvent();
            event.setEventType(eventType);
            event.setCreatedAt(Instant.now());

            String username = SecurityContextHolder.getContext().getAuthentication() != null
                    ? SecurityContextHolder.getContext().getAuthentication().getName()
                    : null;
            if (username != null && !username.equals("anonymousUser")) {
                userRepository.findUserByUsername(username).ifPresent(event::setUser);
            }

            repository.save(event);
        } catch (Exception e) {
            log.warn("Failed to write system event for eventType={}: {}", eventType, e.getMessage());
        }
    }
}
