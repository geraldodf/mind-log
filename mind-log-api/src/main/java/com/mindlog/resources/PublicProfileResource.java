package com.mindlog.resources;

import com.mindlog.data.dtos.profile.PublicProfileDTO;
import com.mindlog.data.dtos.usermedia.UserMediaDTO;
import com.mindlog.services.profile.PublicProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/profiles")
@RequiredArgsConstructor
public class PublicProfileResource {

    private final PublicProfileService service;

    @GetMapping("/{username}")
    public ResponseEntity<PublicProfileDTO> getProfile(@PathVariable String username) {
        return ResponseEntity.ok(service.getProfile(username));
    }

    @GetMapping("/{username}/media")
    public ResponseEntity<Page<UserMediaDTO>> getPublicMedia(
            @PathVariable String username,
            @RequestParam(required = false) Long mediaTypeId,
            @RequestParam(required = false) Long statusId,
            Pageable pageable) {
        return ResponseEntity.ok(service.getPublicMedia(username, mediaTypeId, statusId, pageable));
    }
}
