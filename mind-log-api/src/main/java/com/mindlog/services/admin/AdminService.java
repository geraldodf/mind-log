package com.mindlog.services.admin;

import com.mindlog.data.dtos.admin.AdminMetricsDTO;
import com.mindlog.data.dtos.admin.UserActivityDTO;
import com.mindlog.repositories.FollowRepository;
import com.mindlog.repositories.NotificationRepository;
import com.mindlog.repositories.UserMediaRepository;
import com.mindlog.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private final UserRepository userRepository;
    private final UserMediaRepository userMediaRepository;
    private final FollowRepository followRepository;
    private final NotificationRepository notificationRepository;

    public AdminMetricsDTO getMetrics() {
        long totalUsers = userRepository.count();
        long newUsersToday = userRepository.countUsersCreatedToday();
        long totalMedia = userMediaRepository.count();
        long mediaToday = userMediaRepository.countMediaCreatedToday();
        long totalFollows = followRepository.count();
        long totalNotifications = notificationRepository.count();
        long unreadNotifications = notificationRepository.countByIsReadFalse();
        List<UserActivityDTO> mostActive = userMediaRepository.findMostActiveUsers(PageRequest.of(0, 5)).getContent();

        return new AdminMetricsDTO(totalUsers, newUsersToday, totalMedia, mediaToday, totalFollows, totalNotifications, unreadNotifications, mostActive);
    }
}
