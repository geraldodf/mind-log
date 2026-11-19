package com.mindlog.resources;

import com.mindlog.data.dtos.retrospective.RetrospectiveDTO;
import com.mindlog.services.retrospective.RetrospectiveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/v1/retrospective")
@RequiredArgsConstructor
public class RetrospectiveResource {

    private final RetrospectiveService service;

    @GetMapping("/years")
    public ResponseEntity<List<Integer>> getYears() {
        return ResponseEntity.ok(service.getYears());
    }

    @GetMapping("/{year}")
    public ResponseEntity<RetrospectiveDTO> getRetrospective(@PathVariable int year) {
        return ResponseEntity.ok(service.getRetrospective(year));
    }
}
