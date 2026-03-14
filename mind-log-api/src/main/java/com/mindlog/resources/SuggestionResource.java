package com.mindlog.resources;

import com.mindlog.data.dtos.suggestion.SuggestionCreateDTO;
import com.mindlog.data.dtos.suggestion.SuggestionDTO;
import com.mindlog.data.enums.SuggestionStatus;
import com.mindlog.services.suggestion.SuggestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/suggestions")
@RequiredArgsConstructor
public class SuggestionResource {

    private final SuggestionService service;

    /** Any authenticated user can submit a suggestion. */
    @PostMapping
    public ResponseEntity<SuggestionDTO> submit(@RequestBody @Valid SuggestionCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.submit(dto));
    }

    /** Admin: list all suggestions with pagination. */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<SuggestionDTO>> getAll(Pageable pageable) {
        return ResponseEntity.ok(service.getAll(pageable));
    }

    /** Admin: update suggestion status. */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SuggestionDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam SuggestionStatus status) {
        return ResponseEntity.ok(service.updateStatus(id, status));
    }
}
