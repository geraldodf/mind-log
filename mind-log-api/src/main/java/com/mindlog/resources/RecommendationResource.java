package com.mindlog.resources;

import com.mindlog.data.dtos.recommendation.RecommendationsDTO;
import com.mindlog.data.dtos.usermedia.UserMediaDTO;
import com.mindlog.services.recommendation.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/recommendations")
@RequiredArgsConstructor
public class RecommendationResource {

    private final RecommendationService service;

    @GetMapping
    public ResponseEntity<RecommendationsDTO> get() {
        return ResponseEntity.ok(service.get());
    }

    @PostMapping("/generate")
    public ResponseEntity<RecommendationsDTO> generate(@RequestParam(defaultValue = "en") String lang) {
        return ResponseEntity.ok(service.generate(lang));
    }

    @PostMapping("/{id}/dismiss")
    public ResponseEntity<Void> dismiss(@PathVariable Long id) {
        service.dismiss(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/add")
    public ResponseEntity<UserMediaDTO> add(@PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.add(id));
    }
}
