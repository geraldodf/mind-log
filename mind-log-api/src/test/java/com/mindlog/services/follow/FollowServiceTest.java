package com.mindlog.services.follow;

import com.mindlog.data.models.User;
import com.mindlog.repositories.FollowRepository;
import com.mindlog.repositories.NotificationRepository;
import com.mindlog.repositories.UserRepository;
import com.mindlog.services.AuthService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FollowServiceTest {

    @Mock private FollowRepository followRepository;
    @Mock private UserRepository userRepository;
    @Mock private NotificationRepository notificationRepository;
    @Mock private AuthService authService;

    @InjectMocks
    private FollowService service;

    @Test
    void getFollowers_shouldDropClientSort_becauseOrderingIsFixedInQuery() {
        User target = new User();
        target.setId(1L);
        when(userRepository.findUserByUsername("target")).thenReturn(Optional.of(target));
        when(followRepository.findFollowersByUserId(eq(1L), any(Pageable.class))).thenReturn(new PageImpl<>(List.of()));

        service.getFollowers("target", PageRequest.of(2, 10, Sort.by("followedAt").descending()));

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(followRepository).findFollowersByUserId(eq(1L), captor.capture());
        assertTrue(captor.getValue().getSort().isUnsorted());
        assertEquals(2, captor.getValue().getPageNumber());
        assertEquals(10, captor.getValue().getPageSize());
    }

    @Test
    void getFollowing_shouldDropClientSort_becauseOrderingIsFixedInQuery() {
        User target = new User();
        target.setId(1L);
        when(userRepository.findUserByUsername("target")).thenReturn(Optional.of(target));
        when(followRepository.findFollowingByUserId(eq(1L), any(Pageable.class))).thenReturn(Page.empty());

        service.getFollowing("target", PageRequest.of(0, 20, Sort.by("followedAt").descending()));

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(followRepository).findFollowingByUserId(eq(1L), captor.capture());
        assertTrue(captor.getValue().getSort().isUnsorted());
    }
}
