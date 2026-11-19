package com.mindlog.services.retrospective;

import com.mindlog.data.dtos.retrospective.RetrospectiveDTO;
import com.mindlog.data.models.MediaType;
import com.mindlog.data.models.UserMedia;
import com.mindlog.repositories.UserMediaRepository;
import com.mindlog.services.AuthService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RetrospectiveServiceTest {

    @Mock private UserMediaRepository repo;
    @Mock private AuthService service;

    @InjectMocks
    private RetrospectiveService retrospectiveService;

    @Test
    void getRetrospective_shouldQueryOnlyTheAuthenticatedUserForTheWholeYear() {
        MediaType movie = new MediaType();
        movie.setId(1L);
        movie.setName("Movie");
        movie.setIsSystem(true);
        UserMedia media = new UserMedia();
        media.setId(10L);
        media.setTitle("Dune");
        media.setMediaType(movie);
        media.setEndDate(LocalDate.of(2025, 5, 20));

        when(service.authenticatedId()).thenReturn(7L);
        when(repo.findCompletedBetween(7L, LocalDate.of(2025, 1, 1), LocalDate.of(2025, 12, 31))).thenReturn(List.of(media));
        when(repo.countCompletedWithoutDates(7L)).thenReturn(2L);

        RetrospectiveDTO dto = retrospectiveService.getRetrospective(2025);

        assertThat(dto.year()).isEqualTo(2025);
        assertThat(dto.totalCompleted()).isEqualTo(1);
        assertThat(dto.undatedCompleted()).isEqualTo(2);
        assertThat(dto.busiestMonth()).isEqualTo(5);
    }

    @Test
    void getRetrospective_shouldRejectAnImplausibleYear() {
        assertThatThrownBy(() -> retrospectiveService.getRetrospective(1850)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> retrospectiveService.getRetrospective(LocalDate.now().getYear() + 5)).isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(repo);
    }

    @Test
    void getYears_shouldListTheAuthenticatedUsersYears() {
        when(service.authenticatedId()).thenReturn(7L);
        when(repo.findCompletedYears(7L)).thenReturn(List.of(2026, 2024));

        assertThat(retrospectiveService.getYears()).containsExactly(2026, 2024);
        verify(repo).findCompletedYears(7L);
    }
}
