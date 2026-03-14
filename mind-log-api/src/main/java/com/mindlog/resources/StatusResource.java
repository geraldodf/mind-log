package com.mindlog.resources;

import com.mindlog.data.dtos.status.StatusCreateDTO;
import com.mindlog.data.dtos.status.StatusDTO;
import com.mindlog.services.status.StatusService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/statuses")
@RequiredArgsConstructor
public class StatusResource {

    private final StatusService service;

    @GetMapping
    public ResponseEntity<List<StatusDTO>> getAll() {
        return ResponseEntity.ok(service.getAllAvailable());
    }

    @GetMapping("/my")
    public ResponseEntity<List<StatusDTO>> getMy() {
        return ResponseEntity.ok(service.getMyCustomStatuses());
    }

    @PostMapping
    public ResponseEntity<StatusDTO> create(@RequestBody @Valid StatusCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
