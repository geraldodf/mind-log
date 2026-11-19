package com.mindlog.resources;

import com.mindlog.data.dtos.imports.ImportPreviewDTO;
import com.mindlog.data.dtos.imports.ImportResultDTO;
import com.mindlog.data.enums.ImportSource;
import com.mindlog.services.imports.ImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/v1/import")
@RequiredArgsConstructor
public class ImportResource {

    private static final String MULTIPART = "multipart/form-data";

    private final ImportService service;

    @PostMapping(value = "/preview", consumes = MULTIPART)
    public ResponseEntity<ImportPreviewDTO> preview(@RequestParam ImportSource source,
                                                    @RequestParam MultipartFile file) {
        return ResponseEntity.ok(service.preview(source, file));
    }

    @PostMapping(consumes = MULTIPART)
    public ResponseEntity<ImportResultDTO> execute(@RequestParam ImportSource source,
                                                   @RequestParam MultipartFile file) {
        return ResponseEntity.ok(service.execute(source, file));
    }
}
