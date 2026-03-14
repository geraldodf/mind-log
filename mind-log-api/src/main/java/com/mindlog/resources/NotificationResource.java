package com.mindlog.resources;

import com.mindlog.data.dtos.notification.NotificationDTO;
import com.mindlog.services.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/notifications")
@RequiredArgsConstructor
public class NotificationResource {

    private final NotificationService service;

    @GetMapping
    public ResponseEntity<Page<NotificationDTO>> getAll(Pageable pageable) {
        return ResponseEntity.ok(service.getMyNotifications(pageable));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount() {
        return ResponseEntity.ok(service.countUnread());
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        service.markAsRead(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        service.markAllAsRead();
        return ResponseEntity.noContent().build();
    }
}
