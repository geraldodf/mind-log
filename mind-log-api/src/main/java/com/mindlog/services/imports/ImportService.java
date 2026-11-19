package com.mindlog.services.imports;

import com.mindlog.data.dtos.imports.ExistingMediaDTO;
import com.mindlog.data.dtos.imports.ImportCountDTO;
import com.mindlog.data.dtos.imports.ImportIssueDTO;
import com.mindlog.data.dtos.imports.ImportItemDTO;
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
import com.mindlog.services.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * Importa o histórico de outra plataforma. O MindLog não tem catálogo (o título é texto livre), então
 * não há busca externa: cada entrada nasce com o título do arquivo, sempre PRIVATE. Duplicado (mesmo tipo e
 * mesmo título normalizado) é pulado e contado; linha ruim é listada e o resto segue.
 */
@Slf4j
@Transactional(readOnly = true)
@Service
@RequiredArgsConstructor
public class ImportService {

    private static final int PREVIEW_ITEMS = 50;
    private static final int MAX_ISSUES = 100;
    private static final String MANGA = "Manga";
    private static final String NEW = "NEW";
    private static final String DUPLICATE = "DUPLICATE";

    private final List<ImportParser> parsers;
    private final UserMediaRepository userMediaRepository;
    private final MediaTypeRepository mediaTypeRepository;
    private final StatusRepository statusRepository;
    private final AuthService authService;

    /** Lê o arquivo e diz o que seria feito; não grava nada. */
    public ImportPreviewDTO preview(ImportSource source, MultipartFile file) {
        Analysis analysis = analyse(source, file, authService.authenticatedId());

        Map<String, Integer> byMediaType = new LinkedHashMap<>();
        Map<String, Integer> byStatus = new LinkedHashMap<>();
        List<ImportItemDTO> items = new ArrayList<>();
        for (Row row : analysis.rows()) {
            ImportedEntry e = row.entry();
            if (!row.duplicate()) {
                byMediaType.merge(e.mediaType(), 1, Integer::sum);
                byStatus.merge(e.status(), 1, Integer::sum);
            }
            if (items.size() < PREVIEW_ITEMS)
                items.add(new ImportItemDTO(e.title(), e.mediaType(), e.status(), e.rating(),
                        row.duplicate() ? DUPLICATE : NEW));
        }
        return new ImportPreviewDTO(
                analysis.toImport(),
                analysis.duplicates(),
                analysis.invalid(),
                counts(byMediaType),
                counts(byStatus),
                items,
                capped(analysis.issues()),
                analysis.issues().size());
    }

    /** Grava as entradas novas numa transação: ou entra tudo, ou nada. */
    @Transactional
    public ImportResultDTO execute(ImportSource source, MultipartFile file) {
        User user = authService.authenticated();
        Analysis analysis = analyse(source, file, user.getId());

        Map<String, MediaType> types = new HashMap<>();
        mediaTypeRepository.findAllAvailableForUser(user.getId())
                .forEach(t -> types.putIfAbsent(key(t.getName()), t)); // o de sistema vem primeiro
        Map<String, Status> statuses = new HashMap<>();
        statusRepository.findAllSystem().forEach(s -> statuses.put(key(s.getName()), s));

        List<UserMedia> toSave = new ArrayList<>();
        for (Row row : analysis.rows()) {
            if (row.duplicate()) continue;
            ImportedEntry e = row.entry();
            MediaType type = types.get(key(e.mediaType()));
            if (type == null) {
                type = customType(e.mediaType(), user);
                types.put(key(e.mediaType()), type);
            }
            Status status = statuses.get(key(e.status()));
            if (status == null) throw new ResourceNotFoundException("Status not found.");
            toSave.add(toMedia(e, user, type, status));
        }
        userMediaRepository.saveAll(toSave);
        log.info("Import from {}: {} created, {} duplicates, {} invalid, user {}",
                source, toSave.size(), analysis.duplicates(), analysis.invalid(), user.getUsername());
        return new ImportResultDTO(toSave.size(), analysis.duplicates(), analysis.invalid(),
                capped(analysis.issues()), analysis.issues().size());
    }

    private Analysis analyse(ImportSource source, MultipartFile file, Long userId) {
        if (file == null || file.isEmpty()) throw ImportErrors.empty();
        if (!acceptsName(source, file.getOriginalFilename())) throw ImportErrors.invalid();

        ParsedImport parsed = parse(source, file);
        if (parsed.entries().size() > ImportLimits.MAX_ENTRIES) throw ImportErrors.tooManyEntries();

        Set<String> known = new HashSet<>();
        for (ExistingMediaDTO existing : userMediaRepository.findTitlesByUserId(userId))
            known.add(identity(existing.mediaTypeName(), existing.title()));

        List<Row> rows = new ArrayList<>();
        int duplicates = 0;
        for (ImportedEntry entry : parsed.entries()) {
            boolean duplicate = !known.add(identity(entry.mediaType(), entry.title()));
            if (duplicate) duplicates++;
            rows.add(new Row(entry, duplicate));
        }
        // "rating.invalid" é aviso (a entrada entra sem nota); as demais ignoram a linha.
        int invalid = (int) parsed.issues().stream().filter(i -> !"rating.invalid".equals(i.code())).count();
        return new Analysis(rows, parsed.issues(), parsed.entries().size() - duplicates, duplicates, invalid);
    }

    private ParsedImport parse(ImportSource source, MultipartFile file) {
        ImportParser parser = parsers.stream()
                .filter(p -> p.source() == source)
                .findFirst()
                .orElseThrow(ImportErrors::invalid);
        try (InputStream in = file.getInputStream()) {
            return parser.parse(in);
        } catch (IOException e) {
            throw ImportErrors.invalid();
        }
    }

    private boolean acceptsName(ImportSource source, String filename) {
        String name = filename == null ? "" : filename.toLowerCase(Locale.ROOT);
        return switch (source) {
            case LETTERBOXD -> name.endsWith(".zip");
            case GOODREADS -> name.endsWith(".csv");
            case MYANIMELIST -> name.endsWith(".xml") || name.endsWith(".gz");
        };
    }

    /** Só o tipo "Manga" é criado na hora (do próprio usuário); os de sistema já existem desde o V1. */
    private MediaType customType(String name, User user) {
        if (!MANGA.equals(name)) throw new ResourceNotFoundException("Media type not found.");
        MediaType type = new MediaType();
        type.setName(name);
        type.setIsSystem(false);
        type.setUser(user);
        type.setCreatedAt(Instant.now());
        return mediaTypeRepository.save(type);
    }

    private UserMedia toMedia(ImportedEntry e, User user, MediaType type, Status status) {
        UserMedia media = new UserMedia();
        media.setUser(user);
        media.setTitle(e.title());
        media.setMediaType(type);
        media.setStatus(status);
        media.setRating(e.rating());
        media.setStartDate(e.startDate());
        media.setEndDate(e.endDate());
        media.setNotes(e.notes());
        media.setReview(e.review());
        media.setVisibility(Visibility.PRIVATE);
        media.setIsFavorite(false);
        return media;
    }

    private List<ImportCountDTO> counts(Map<String, Integer> map) {
        return map.entrySet().stream().map(e -> new ImportCountDTO(e.getKey(), e.getValue())).toList();
    }

    private List<ImportIssueDTO> capped(List<ImportIssueDTO> issues) {
        return issues.size() <= MAX_ISSUES ? issues : issues.subList(0, MAX_ISSUES);
    }

    private String identity(String mediaType, String title) {
        return key(mediaType) + "|" + ImportText.normalize(title);
    }

    private String key(String name) {
        return name.toLowerCase(Locale.ROOT);
    }

    private record Row(ImportedEntry entry, boolean duplicate) {}

    private record Analysis(List<Row> rows, List<ImportIssueDTO> issues, int toImport, int duplicates, int invalid) {}
}
