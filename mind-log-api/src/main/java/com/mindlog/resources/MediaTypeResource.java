package com.mindlog.resources;

import com.mindlog.data.dtos.mediatype.MediaTypeCreateDTO;
import com.mindlog.data.dtos.mediatype.MediaTypeDTO;
import com.mindlog.services.mediatype.MediaTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/media-types")
@RequiredArgsConstructor
public class MediaTypeResource {

    private final MediaTypeService service;

    @GetMapping
    public ResponseEntity<List<MediaTypeDTO>> getAll() {
        return ResponseEntity.ok(service.getAllAvailable());
    }

    @GetMapping("/my")
    public ResponseEntity<List<MediaTypeDTO>> getMy() {
        return ResponseEntity.ok(service.getMyCustomTypes());
    }

    @PostMapping
    public ResponseEntity<MediaTypeDTO> create(@RequestBody @Valid MediaTypeCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
