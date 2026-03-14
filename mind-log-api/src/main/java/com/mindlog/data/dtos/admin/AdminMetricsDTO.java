package com.mindlog.data.dtos.admin;

public record AdminMetricsDTO(
    long totalUsers,
    long newUsersToday,
    long activeUsersToday,
    long totalMediaEntries,
    long mediaCreatedToday,
    long categoriesCreatedToday,
    long totalFollows,
    long totalNotifications,
    long unreadNotifications,
    java.util.List<UserActivityDTO> mostActiveUsers
) {}
