package com.mindlog.services.imports;

import com.mindlog.data.dtos.imports.ExistingMediaDTO;
import com.mindlog.data.dtos.imports.ImportPreviewDTO;
import com.mindlog.data.dtos.imports.ImportResultDTO;
import com.mindlog.data.enums.ImportSource;
import com.mindlog.data.enums.Visibility;
import com.mindlog.data.models.MediaType;
import com.mindlog.data.models.Status;
import com.mindlog.data.models.User;
import com.mindlog.data.models.UserMedia;
import com.mindlog.repositories.MediaTypeRepository;
import com.mindlog.repositories.StatusRepository;
import com.mindlog.repositories.UserMediaRepository;
import com.mindlog.services.AuthService;
import com.mindlog.services.exceptions.FieldValidationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ImportServiceTest {

    private static final String GOODREADS_HEADER = "Title,Exclusive Shelf,My Rating,Date Read,My Review\n";
    private static final String MAL = """
            <myanimelist>
              <anime><series_title>Cowboy Bebop</series_title><my_status>Completed</my_status><my_score>9</my_score></anime>
              <manga><manga_title>Berserk</manga_title><my_status>Reading</my_status><my_score>10</my_score></manga>
            </myanimelist>
            """;

    @Mock private UserMediaRepository userMediaRepository;
    @Mock private MediaTypeRepository mediaTypeRepository;
    @Mock private StatusRepository statusRepository;
    @Mock private AuthService authService;

    private ImportService service;
    private User user;
    private MediaType book;
    private MediaType anime;

    @BeforeEach
    void setUp() {
        service = new ImportService(
                List.of(new LetterboxdParser(), new GoodreadsParser(), new MyAnimeListParser()),
                userMediaRepository, mediaTypeRepository, statusRepository, authService);

        user = new User();
        user.setId(1L);
        user.setUsername("tester");
        book = type(1L, "Book", true, null);
        anime = type(2L, "Anime", true, null);

        lenient().when(authService.authenticated()).thenReturn(user);
        lenient().when(authService.authenticatedId()).thenReturn(1L);
        lenient().when(mediaTypeRepository.findAllAvailableForUser(1L))
                .thenReturn(List.of(book, anime, type(3L, "Movie", true, null)));
        lenient().when(statusRepository.findAllSystem()).thenReturn(List.of(
                status(1L, "Planned"), status(2L, "In Progress"), status(3L, "Completed"),
                status(4L, "Paused"), status(5L, "Dropped")));
        lenient().when(userMediaRepository.findTitlesByUserId(1L)).thenReturn(List.of());
    }

    @Test
    void preview_countsNewDuplicatesAndInvalidWithoutSaving() {
        when(userMediaRepository.findTitlesByUserId(1L))
                .thenReturn(List.of(new ExistingMediaDTO("dune", "Book")));

        ImportPreviewDTO preview = service.preview(ImportSource.GOODREADS, csv(GOODREADS_HEADER
                + "Dune,read,5,2023/01/02,\n"
                + "Emma,to-read,0,,\n"
                + "Weird,my-custom-shelf,0,,\n"));

        assertThat(preview.toImport()).isEqualTo(1);
        assertThat(preview.duplicates()).isEqualTo(1);
        assertThat(preview.invalid()).isEqualTo(1);
        assertThat(preview.issues()).extracting("code").containsExactly("shelf.unknown");
        assertThat(preview.byStatus()).extracting("name").containsExactly("Planned");
        assertThat(preview.items()).extracting("state").containsExactly("DUPLICATE", "NEW");
        verify(userMediaRepository, never()).saveAll(any());
    }

    @Test
    void execute_savesNewEntriesAsPrivateAndSkipsDuplicates() {
        when(userMediaRepository.findTitlesByUserId(1L))
                .thenReturn(List.of(new ExistingMediaDTO("Amélie Poulain", "Book")));

        ImportResultDTO result = service.execute(ImportSource.GOODREADS, csv(GOODREADS_HEADER
                + "Dune,read,5,2023/01/02,\"<p>Great</p>\"\n"
                + "AMELIE   poulain,read,3,,\n"
                + "Dune,read,5,,\n"));

        assertThat(result.imported()).isEqualTo(1);
        assertThat(result.duplicates()).isEqualTo(2);

        UserMedia saved = savedEntries().get(0);
        assertThat(saved.getTitle()).isEqualTo("Dune");
        assertThat(saved.getMediaType()).isSameAs(book);
        assertThat(saved.getStatus().getName()).isEqualTo("Completed");
        assertThat(saved.getRating()).isEqualTo(5);
        assertThat(saved.getVisibility()).isEqualTo(Visibility.PRIVATE);
        assertThat(saved.getIsFavorite()).isFalse();
        assertThat(saved.getRecommendation()).isNull();
        assertThat(saved.getReview()).isEqualTo("Great");
        assertThat(saved.getUser()).isSameAs(user);
    }

    @Test
    void execute_createsTheUsersOwnMangaTypeOnlyOnce() {
        when(mediaTypeRepository.save(any(MediaType.class))).thenAnswer(i -> i.getArgument(0));

        ImportResultDTO result = service.execute(ImportSource.MYANIMELIST, upload("list.xml", MAL));

        assertThat(result.imported()).isEqualTo(2);
        ArgumentCaptor<MediaType> created = ArgumentCaptor.forClass(MediaType.class);
        verify(mediaTypeRepository).save(created.capture());
        assertThat(created.getValue().getName()).isEqualTo("Manga");
        assertThat(created.getValue().getIsSystem()).isFalse();
        assertThat(created.getValue().getUser()).isSameAs(user);
        assertThat(savedEntries()).extracting(m -> m.getMediaType().getName()).containsExactly("Anime", "Manga");
    }

    @Test
    void execute_reusesAnExistingMangaTypeOfTheUser() {
        MediaType manga = type(9L, "Manga", false, user);
        when(mediaTypeRepository.findAllAvailableForUser(1L)).thenReturn(List.of(book, anime, manga));

        service.execute(ImportSource.MYANIMELIST, upload("list.xml", MAL));

        verify(mediaTypeRepository, never()).save(any());
        assertThat(savedEntries().get(1).getMediaType()).isSameAs(manga);
    }

    @Test
    void execute_doesNotSaveTwiceOnReimport() {
        when(userMediaRepository.findTitlesByUserId(1L)).thenReturn(List.of(
                new ExistingMediaDTO("Cowboy Bebop", "Anime"), new ExistingMediaDTO("Berserk", "Manga")));

        ImportResultDTO result = service.execute(ImportSource.MYANIMELIST, upload("list.xml", MAL));

        assertThat(result.imported()).isZero();
        assertThat(result.duplicates()).isEqualTo(2);
        verify(mediaTypeRepository, never()).save(any());
    }

    @Test
    void sameTitleInAnotherMediaTypeIsNotADuplicate() {
        when(userMediaRepository.findTitlesByUserId(1L)).thenReturn(List.of(new ExistingMediaDTO("Dune", "Movie")));

        ImportPreviewDTO preview = service.preview(ImportSource.GOODREADS,
                csv(GOODREADS_HEADER + "Dune,read,5,,\n"));

        assertThat(preview.toImport()).isEqualTo(1);
    }

    @Test
    void rejectsEmptyFileWrongExtensionAndTooManyEntries() {
        assertThatThrownBy(() -> service.preview(ImportSource.GOODREADS, upload("x.csv", "")))
                .isInstanceOfSatisfying(FieldValidationException.class, e -> assertThat(e.getCode()).isEqualTo("file.empty"));
        assertThatThrownBy(() -> service.preview(ImportSource.GOODREADS, upload("x.zip", "a")))
                .isInstanceOfSatisfying(FieldValidationException.class, e -> assertThat(e.getCode()).isEqualTo("file.invalid"));
        assertThatThrownBy(() -> service.preview(ImportSource.LETTERBOXD, upload("x.csv", "a")))
                .isInstanceOfSatisfying(FieldValidationException.class, e -> assertThat(e.getCode()).isEqualTo("file.invalid"));

        StringBuilder many = new StringBuilder(GOODREADS_HEADER);
        for (int i = 0; i <= ImportLimits.MAX_ENTRIES; i++) many.append("Book ").append(i).append(",read,0,,\n");
        assertThatThrownBy(() -> service.preview(ImportSource.GOODREADS, csv(many.toString())))
                .isInstanceOfSatisfying(FieldValidationException.class, e -> assertThat(e.getCode()).isEqualTo("file.tooManyEntries"));
    }

    @SuppressWarnings("unchecked")
    private List<UserMedia> savedEntries() {
        ArgumentCaptor<List<UserMedia>> captor = ArgumentCaptor.forClass(List.class);
        verify(userMediaRepository).saveAll(captor.capture());
        return captor.getValue();
    }

    private MockMultipartFile csv(String content) {
        return upload("goodreads_library_export.csv", content);
    }

    private MockMultipartFile upload(String name, String content) {
        return new MockMultipartFile("file", name, "application/octet-stream", content.getBytes(StandardCharsets.UTF_8));
    }

    private MediaType type(Long id, String name, boolean system, User owner) {
        MediaType type = new MediaType();
        type.setId(id);
        type.setName(name);
        type.setIsSystem(system);
        type.setUser(owner);
        return type;
    }

    private Status status(Long id, String name) {
        Status status = new Status();
        status.setId(id);
        status.setName(name);
        status.setIsSystem(true);
        return status;
    }
}
