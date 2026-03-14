package com.mindlog.services.audit;

import com.mindlog.data.dtos.audit.AuditLogDTO;
import com.mindlog.repositories.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuditLogService {

    private final AuditLogRepository repository;

    public Page<AuditLogDTO> getAll(Pageable pageable) {
        return repository.findAllByOrderByCreatedAtDesc(pageable).map(a -> new AuditLogDTO(
                a.getId(),
                a.getUser() != null ? a.getUser().getId() : null,
                a.getUser() != null ? a.getUser().getUsername() : "system",
                a.getAction(),
                a.getEntityType(),
                a.getEntityId(),
                a.getMetadata(),
                a.getIpAddress(),
                a.getCreatedAt()
        ));
    }
}
