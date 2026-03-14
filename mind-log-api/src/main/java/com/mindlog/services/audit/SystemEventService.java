package com.mindlog.services.audit;

import com.mindlog.data.dtos.admin.SystemEventDTO;
import com.mindlog.repositories.SystemEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SystemEventService {

    private final SystemEventRepository repository;

    public Page<SystemEventDTO> getAll(Pageable pageable) {
        return repository.findAllByOrderByCreatedAtDesc(pageable).map(e -> new SystemEventDTO(
                e.getId(),
                e.getEventType(),
                e.getUser() != null ? e.getUser().getUsername() : null,
                e.getCreatedAt()
        ));
    }
}
