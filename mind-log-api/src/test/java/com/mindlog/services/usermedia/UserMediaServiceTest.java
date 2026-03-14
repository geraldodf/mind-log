package com.mindlog.services.usermedia;

import com.mindlog.data.dtos.usermedia.UserMediaCreateDTO;
import com.mindlog.data.dtos.usermedia.UserMediaDTO;
import com.mindlog.data.enums.Visibility;
import com.mindlog.data.models.*;
import com.mindlog.repositories.*;
import com.mindlog.services.AuthService;
import com.mindlog.services.audit.AuditService;
import com.mindlog.services.exceptions.ForbiddenException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserMediaServiceTest {

    @Mock private UserMediaRepository repository;
    @Mock private MediaTypeRepository mediaTypeRepository;
    @Mock private StatusRepository statusRepository;
    @Mock private AuthService authService;
    @Mock private AuditService auditService;

    @InjectMocks
    private UserMediaService service;

    private User user;
    private MediaType mediaType;
    private Status status;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setUsername("testuser");

        mediaType = new MediaType();
        mediaType.setId(1L);
        mediaType.setName("Movie");
        mediaType.setIsSystem(true);

        status = new Status();
        status.setId(1L);
        status.setName("Planned");
        status.setIsSystem(true);
    }

    @Test
    void create_shouldReturnDTO_whenValidInput() {
        UserMediaCreateDTO dto = new UserMediaCreateDTO(
                "Inception", 1L, 1L, 5, "😍",
                com.mindlog.data.enums.Recommendation.RECOMMEND,
                null, null, null, "Great movie", null, Visibility.PRIVATE
        );

        UserMedia saved = new UserMedia();
        saved.setId(1L);
        saved.setTitle("Inception");
        saved.setUser(user);
        saved.setMediaType(mediaType);
        saved.setStatus(status);
        saved.setRating(5);
        saved.setVisibility(Visibility.PRIVATE);

        when(authService.authenticated()).thenReturn(user);
        when(mediaTypeRepository.findById(1L)).thenReturn(Optional.of(mediaType));
        when(statusRepository.findById(1L)).thenReturn(Optional.of(status));
        when(repository.save(any(UserMedia.class))).thenReturn(saved);

        UserMediaDTO result = service.create(dto);

        assertThat(result).isNotNull();
        assertThat(result.title()).isEqualTo("Inception");
        verify(auditService).log(eq("MEDIA_CREATED"), eq("UserMedia"), any(), any(), any());
    }

    @Test
    void delete_shouldThrowForbidden_whenNotOwner() {
        User other = new User();
        other.setId(2L);

        UserMedia media = new UserMedia();
        media.setId(1L);
        media.setUser(other);
        media.setTitle("Test");
        media.setMediaType(mediaType);
        media.setStatus(status);
        media.setVisibility(Visibility.PRIVATE);

        when(authService.authenticated()).thenReturn(user);
        when(repository.findById(1L)).thenReturn(Optional.of(media));

        assertThatThrownBy(() -> service.delete(1L))
                .isInstanceOf(ForbiddenException.class);
    }
}
