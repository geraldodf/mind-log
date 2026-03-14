package com.mindlog.services.notification;

import com.mindlog.data.models.*;
import com.mindlog.repositories.NotificationRepository;
import com.mindlog.repositories.UserMediaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationSchedulerTest {

    @Mock private UserMediaRepository userMediaRepository;
    @Mock private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationScheduler scheduler;

    @Test
    void checkUpcomingReleases_shouldCreateNotification_whenNotExists() {
        User user = new User();
        user.setId(1L);
        user.setUsername("user");

        MediaType type = new MediaType();
        type.setId(1L); type.setName("Series"); type.setIsSystem(true);

        Status status = new Status();
        status.setId(1L); status.setName("In Progress"); status.setIsSystem(true);

        UserMedia media = new UserMedia();
        media.setId(1L);
        media.setTitle("Attack on Titan");
        media.setUser(user);
        media.setMediaType(type);
        media.setStatus(status);
        media.setNextReleaseDate(LocalDate.now());
        media.setVisibility(com.mindlog.data.enums.Visibility.PRIVATE);

        when(userMediaRepository.findByNextReleaseDate(LocalDate.now())).thenReturn(List.of(media));
        when(userMediaRepository.findByNextReleaseDate(LocalDate.now().plusDays(3))).thenReturn(List.of());
        when(notificationRepository.existsByUserMediaIdAndMessage(eq(1L), anyString())).thenReturn(false);

        scheduler.checkUpcomingReleases();

        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void checkUpcomingReleases_shouldNotCreateDuplicate_whenAlreadyExists() {
        User user = new User();
        user.setId(1L);
        user.setUsername("user");

        MediaType type = new MediaType();
        type.setId(1L); type.setName("Series"); type.setIsSystem(true);

        Status status = new Status();
        status.setId(1L); status.setName("In Progress"); status.setIsSystem(true);

        UserMedia media = new UserMedia();
        media.setId(1L);
        media.setTitle("Attack on Titan");
        media.setUser(user);
        media.setMediaType(type);
        media.setStatus(status);
        media.setNextReleaseDate(LocalDate.now());
        media.setVisibility(com.mindlog.data.enums.Visibility.PRIVATE);

        when(userMediaRepository.findByNextReleaseDate(LocalDate.now())).thenReturn(List.of(media));
        when(userMediaRepository.findByNextReleaseDate(LocalDate.now().plusDays(3))).thenReturn(List.of());
        when(notificationRepository.existsByUserMediaIdAndMessage(eq(1L), anyString())).thenReturn(true);

        scheduler.checkUpcomingReleases();

        verify(notificationRepository, never()).save(any());
    }
}
