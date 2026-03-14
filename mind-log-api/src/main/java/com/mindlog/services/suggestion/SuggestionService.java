package com.mindlog.services.suggestion;

import com.mindlog.data.dtos.suggestion.SuggestionCreateDTO;
import com.mindlog.data.dtos.suggestion.SuggestionDTO;
import com.mindlog.data.enums.SuggestionStatus;
import com.mindlog.data.models.Suggestion;
import com.mindlog.data.models.User;
import com.mindlog.repositories.SuggestionRepository;
import com.mindlog.services.AuthService;
import com.mindlog.services.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SuggestionService {

    private final SuggestionRepository repository;
    private final AuthService authService;

    @Transactional
    public SuggestionDTO submit(SuggestionCreateDTO dto) {
        User user = authService.authenticated();
        Suggestion suggestion = new Suggestion();
        suggestion.setUser(user);
        suggestion.setContent(dto.content());
        suggestion = repository.save(suggestion);
        log.info("Suggestion submitted by user {}", user.getId());
        return toDTO(suggestion);
    }

    @Transactional(readOnly = true)
    public Page<SuggestionDTO> getAll(Pageable pageable) {
        return repository.findAllByOrderByCreatedAtDesc(pageable).map(this::toDTO);
    }

    @Transactional
    public SuggestionDTO updateStatus(Long id, SuggestionStatus status) {
        Suggestion suggestion = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Suggestion not found."));
        suggestion.setStatus(status);
        return toDTO(repository.save(suggestion));
    }

    private SuggestionDTO toDTO(Suggestion s) {
        return new SuggestionDTO(
                s.getId(),
                s.getUser() != null ? s.getUser().getId() : null,
                s.getUser() != null ? s.getUser().getUsername() : "deleted",
                s.getContent(),
                s.getStatus(),
                s.getCreatedAt()
        );
    }
}
