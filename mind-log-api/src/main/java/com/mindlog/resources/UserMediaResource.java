package com.mindlog.resources;

import com.mindlog.data.dtos.usermedia.UserMediaDTO;
import com.mindlog.data.dtos.usermedia.UserMediaSaveDTO;
import com.mindlog.services.usermedia.UserMediaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/media")
@RequiredArgsConstructor
public class UserMediaResource {

    private final UserMediaService service;

    @GetMapping
    public ResponseEntity<Page<UserMediaDTO>> getAll(
            @RequestParam(required = false) Long mediaTypeId,
            @RequestParam(required = false) Long statusId,
            @RequestParam(required = false) String recommendation,
            Pageable pageable) {
        return ResponseEntity.ok(service.getMyMedia(mediaTypeId, statusId, recommendation, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserMediaDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<UserMediaDTO>> getUpcoming() {
        return ResponseEntity.ok(service.getUpcomingReleases());
    }

    @PostMapping
    public ResponseEntity<UserMediaDTO> create(@RequestBody @Valid UserMediaSaveDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserMediaDTO> update(@PathVariable Long id, @RequestBody @Valid UserMediaSaveDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
