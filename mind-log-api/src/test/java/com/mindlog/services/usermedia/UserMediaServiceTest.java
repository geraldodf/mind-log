package com.mindlog.services.usermedia;

import com.mindlog.data.dtos.usermedia.UserMediaDTO;
import com.mindlog.data.dtos.usermedia.UserMediaSaveDTO;
import com.mindlog.data.enums.Visibility;
import com.mindlog.data.models.*;
import com.mindlog.repositories.*;
import com.mindlog.services.AuthService;
import com.mindlog.services.exceptions.ForbiddenException;
import com.mindlog.services.exceptions.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
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
        UserMediaSaveDTO dto = new UserMediaSaveDTO(
                "Inception", 1L, 1L, 5, List.of("😍"),
                com.mindlog.data.enums.Recommendation.RECOMMEND,
                null, null, null, "Great movie", null, Visibility.PRIVATE,
                false, null
        );

        UserMedia saved = new UserMedia();
        saved.setId(1L);
        saved.setTitle("Inception");
        saved.setUser(user);
        saved.setMediaType(mediaType);
        saved.setStatus(status);
        saved.setRating(5);
        saved.setFeelings(List.of("😍"));
        saved.setVisibility(Visibility.PRIVATE);
        saved.setIsFavorite(false);

        when(authService.authenticated()).thenReturn(user);
        when(mediaTypeRepository.findById(1L)).thenReturn(Optional.of(mediaType));
        when(statusRepository.findById(1L)).thenReturn(Optional.of(status));
        when(repository.save(any(UserMedia.class))).thenReturn(saved);

        UserMediaDTO result = service.create(dto);

        assertThat(result).isNotNull();
        assertThat(result.title()).isEqualTo("Inception");
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

    @Test
    void create_shouldRejectMediaTypeOwnedByAnotherUser() {
        User other = new User();
        other.setId(2L);
        MediaType foreign = new MediaType();
        foreign.setId(9L);
        foreign.setName("Private type of user 2");
        foreign.setIsSystem(false);
        foreign.setUser(other);

        when(authService.authenticated()).thenReturn(user);
        when(mediaTypeRepository.findById(9L)).thenReturn(Optional.of(foreign));

        assertThatThrownBy(() -> service.create(saveDTO(9L, 1L)))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(repository, never()).save(any());
    }

    @Test
    void create_shouldRejectStatusOwnedByAnotherUser() {
        User other = new User();
        other.setId(2L);
        Status foreign = new Status();
        foreign.setId(9L);
        foreign.setName("Private status of user 2");
        foreign.setIsSystem(false);
        foreign.setUser(other);

        when(authService.authenticated()).thenReturn(user);
        when(mediaTypeRepository.findById(1L)).thenReturn(Optional.of(mediaType));
        when(statusRepository.findById(9L)).thenReturn(Optional.of(foreign));

        assertThatThrownBy(() -> service.create(saveDTO(1L, 9L)))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(repository, never()).save(any());
    }

    @Test
    void update_shouldRejectMediaTypeOwnedByAnotherUser() {
        User other = new User();
        other.setId(2L);
        MediaType foreign = new MediaType();
        foreign.setId(9L);
        foreign.setIsSystem(false);
        foreign.setUser(other);

        UserMedia media = new UserMedia();
        media.setId(1L);
        media.setUser(user);
        media.setMediaType(mediaType);
        media.setStatus(status);

        when(authService.authenticated()).thenReturn(user);
        when(repository.findById(1L)).thenReturn(Optional.of(media));
        when(mediaTypeRepository.findById(9L)).thenReturn(Optional.of(foreign));

        assertThatThrownBy(() -> service.update(1L, saveDTO(9L, 1L)))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(repository, never()).save(any());
    }

    @Test
    void create_shouldAcceptOwnCustomMediaType() {
        MediaType own = new MediaType();
        own.setId(5L);
        own.setName("Anime");
        own.setIsSystem(false);
        own.setUser(user);

        UserMedia saved = new UserMedia();
        saved.setId(1L);
        saved.setTitle("Inception");
        saved.setUser(user);
        saved.setMediaType(own);
        saved.setStatus(status);
        saved.setVisibility(Visibility.PRIVATE);
        saved.setIsFavorite(false);

        when(authService.authenticated()).thenReturn(user);
        when(mediaTypeRepository.findById(5L)).thenReturn(Optional.of(own));
        when(statusRepository.findById(1L)).thenReturn(Optional.of(status));
        when(repository.save(any(UserMedia.class))).thenReturn(saved);

        assertThat(service.create(saveDTO(5L, 1L)).mediaType().name()).isEqualTo("Anime");
    }

    private UserMediaSaveDTO saveDTO(Long mediaTypeId, Long statusId) {
        return new UserMediaSaveDTO(
                "Inception", mediaTypeId, statusId, null, List.of(),
                null, null, null, null, null, null, Visibility.PRIVATE,
                false, null
        );
    }
}
