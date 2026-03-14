package com.mindlog.services.notification;

import com.mindlog.data.models.Notification;
import com.mindlog.data.models.UserMedia;
import com.mindlog.repositories.NotificationRepository;
import com.mindlog.repositories.UserMediaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationScheduler {

    private final UserMediaRepository userMediaRepository;
    private final NotificationRepository notificationRepository;

    /**
     * Runs every day at 08:00 AM.
     * Creates notifications for media entries whose next release date is today or within 3 days.
     */
    @Transactional
    @Scheduled(cron = "0 0 8 * * *")
    public void checkUpcomingReleases() {
        log.info("Running upcoming release notification check...");

        LocalDate today = LocalDate.now();
        LocalDate in3Days = today.plusDays(3);

        List<UserMedia> upcoming = userMediaRepository.findByNextReleaseDate(today);
        List<UserMedia> in3DaysList = userMediaRepository.findByNextReleaseDate(in3Days);

        createNotificationsIfNotExist(upcoming, "Today is the release date for \"%s\"! 🎉");
        createNotificationsIfNotExist(in3DaysList, "Upcoming release in 3 days: \"%s\" 📅");

        log.info("Notification check complete. Processed {} entries.", upcoming.size() + in3DaysList.size());
    }

    private void createNotificationsIfNotExist(List<UserMedia> entries, String messageTemplate) {
        for (UserMedia media : entries) {
            String message = String.format(messageTemplate, media.getTitle());

            boolean alreadyExists = notificationRepository.existsByUserMediaIdAndMessage(media.getId(), message);
            if (!alreadyExists) {
                Notification notification = new Notification();
                notification.setUser(media.getUser());
                notification.setUserMedia(media);
                notification.setMessage(message);
                notification.setIsRead(false);
                notification.setCreatedAt(Instant.now());
                notificationRepository.save(notification);
                log.info("Notification created for user {} - media '{}'", media.getUser().getId(), media.getTitle());
            }
        }
    }
}
