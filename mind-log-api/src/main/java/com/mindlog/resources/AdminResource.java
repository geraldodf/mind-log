package com.mindlog.resources;

import com.mindlog.data.dtos.admin.AdminMetricsDTO;
import com.mindlog.data.dtos.admin.SystemEventDTO;
import com.mindlog.services.admin.AdminService;
import com.mindlog.services.audit.SystemEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminResource {

    private final AdminService adminService;
    private final SystemEventService systemEventService;

    @GetMapping("/metrics")
    public ResponseEntity<AdminMetricsDTO> getMetrics() {
        return ResponseEntity.ok(adminService.getMetrics());
    }

    @GetMapping("/system-events")
    public ResponseEntity<Page<SystemEventDTO>> getSystemEvents(Pageable pageable) {
        return ResponseEntity.ok(systemEventService.getAll(pageable));
    }
}
