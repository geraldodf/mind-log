package com.mindlog.services.recommendation;

import com.mindlog.data.dtos.mediatype.MediaTypeDTO;
import com.mindlog.data.dtos.recommendation.LibraryEntryDTO;
import com.mindlog.data.dtos.recommendation.RecommendationDTO;
import com.mindlog.data.dtos.recommendation.RecommendationInput;
import com.mindlog.data.dtos.recommendation.RecommendationsDTO;
import com.mindlog.data.dtos.recommendation.ValidRecommendation;
import com.mindlog.data.dtos.usermedia.UserMediaDTO;
import com.mindlog.data.dtos.usermedia.UserMediaSaveDTO;
import com.mindlog.data.enums.RecommendationStatus;
import com.mindlog.data.enums.Visibility;
import com.mindlog.data.models.MediaRecommendation;
import com.mindlog.data.models.MediaType;
import com.mindlog.data.models.RecommendationBatch;
import com.mindlog.data.models.Status;
import com.mindlog.data.models.User;
import com.mindlog.infra.ai.LlmProvider;
import com.mindlog.infra.ai.LlmResponse;
import com.mindlog.repositories.MediaRecommendationRepository;
import com.mindlog.repositories.MediaTypeRepository;
import com.mindlog.repositories.RecommendationBatchRepository;
import com.mindlog.repositories.StatusRepository;
import com.mindlog.repositories.UserMediaRepository;
import com.mindlog.repositories.UserRepository;
import com.mindlog.services.AuthService;
import com.mindlog.services.exceptions.AIRateLimitException;
import com.mindlog.services.exceptions.AIResponseParseException;
import com.mindlog.services.exceptions.AIUnavailableException;
import com.mindlog.services.exceptions.ResourceNotFoundException;
import com.mindlog.services.recommendation.RecommendationPromptBuilder.RecommendationPrompt;
import com.mindlog.services.usermedia.UserMediaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Recomendações de mídia a partir do que o usuário avaliou bem.
 *
 * <p>Gera só quando o usuário pede, com cache por hash da entrada (biblioteca inalterada não
 * chama o modelo nem gasta limite) e no máximo {@value #DAILY_LIMIT} gerações por 24 h.
 */
@Slf4j
@Transactional(readOnly = true)
@Service
@RequiredArgsConstructor
public class RecommendationService {

    static final int MIN_LIKED_RATING = 4;
    static final int MIN_LIKED_ENTRIES = 3;
    static final int MAX_AVOID_RATING = 2;
    static final int DAILY_LIMIT = 3;
    private static final Duration WINDOW = Duration.ofHours(24);
    private static final String PLANNED_STATUS = "Planned";
    /** Modelo da vaga reservada enquanto a chamada ao provedor ainda está em curso. */
    private static final String PENDING_MODEL = "pending";

    private final MediaRecommendationRepository recommendationRepository;
    private final RecommendationBatchRepository batchRepository;
    private final UserMediaRepository userMediaRepository;
    private final UserRepository userRepository;
    private final MediaTypeRepository mediaTypeRepository;
    private final StatusRepository statusRepository;
    private final AuthService authService;
    private final UserMediaService userMediaService;
    private final RecommendationPromptBuilder promptBuilder;
    private final RecommendationResponseParser parser;
    private final ObjectProvider<LlmProvider> llmProvider;
    private final TransactionTemplate transaction;

    public RecommendationsDTO get() {
        return state(authService.authenticatedId());
    }

    /**
     * Sem transação aberta: a chamada ao modelo leva segundos e não deve segurar conexão do pool.
     * Leituras e escritas rodam em transações curtas.
     */
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public RecommendationsDTO generate(String language) {
        LlmProvider provider = llmProvider.getIfAvailable();
        if (provider == null)
            throw new AIUnavailableException("Recommendations are not available.");

        User user = authService.authenticated();
        Long userId = user.getId();

        if (userMediaRepository.countLikedEntries(userId, MIN_LIKED_RATING) < MIN_LIKED_ENTRIES)
            throw new IllegalArgumentException("Rate at least %d entries with %d stars or more to get recommendations."
                    .formatted(MIN_LIKED_ENTRIES, MIN_LIKED_RATING));

        List<MediaType> types = mediaTypeRepository.findAllAvailableForUser(userId);
        RecommendationPrompt prompt = promptBuilder.build(input(userId, types, language));

        // Biblioteca igual à da última geração e ainda há sugestões na tela: devolve o cache, sem custo e sem gastar limite.
        boolean unchanged = batchRepository.findFirstByUserIdOrderByCreatedAtDesc(userId)
                .map(b -> b.getLibraryHash().equals(prompt.inputHash())).orElse(false);
        if (unchanged && recommendationRepository.countByUserIdAndStatus(userId, RecommendationStatus.PENDING) > 0)
            return transaction.execute(s -> state(userId));

        // A vaga é reservada antes da chamada (com a linha do usuário travada), senão pedidos paralelos
        // passariam todos pela contagem e cada um pagaria uma chamada.
        RecommendationBatch batch = reserve(user, prompt.inputHash());

        LlmResponse response;
        List<ValidRecommendation> fresh;
        try {
            response = provider.generateJson(prompt.request());
            fresh = parser.parse(response.json(), prompt.context()).stream()
                    .filter(r -> !userMediaRepository.existsByUserIdAndTitleIgnoreCase(userId, r.title()))
                    .filter(r -> !recommendationRepository.existsResolvedTitle(userId, r.title()))
                    .toList();
        } catch (AIResponseParseException e) {
            // O modelo respondeu (e cobrou), mas o conteúdo não serve: a vaga fica gasta.
            throw e;
        } catch (RuntimeException e) {
            // Falha de infraestrutura (rede, 5xx, limite do provedor, recusa): devolve a vaga.
            batchRepository.deleteById(batch.getId());
            throw e;
        }

        Map<String, MediaType> typesByName = new HashMap<>();
        for (MediaType t : types)
            typesByName.putIfAbsent(key(RecommendationPromptBuilder.sanitize(t.getName(), RecommendationPromptBuilder.MAX_TITLE)), t);

        return transaction.execute(s -> {
            userRepository.findByIdForUpdate(userId);
            batch.setModel(response.model());
            batch.setInputTokens(response.inputTokens());
            batch.setOutputTokens(response.outputTokens());
            batchRepository.save(batch);

            if (!fresh.isEmpty()) recommendationRepository.deletePendingByUserId(userId);
            for (ValidRecommendation r : fresh) {
                MediaType type = typesByName.get(key(r.typeName()));
                if (type == null) continue;
                MediaRecommendation rec = new MediaRecommendation();
                rec.setBatch(batch);
                rec.setUser(user);
                rec.setTitle(r.title());
                rec.setMediaType(type);
                rec.setReason(r.reason());
                rec.setBasedOn(r.basedOn());
                recommendationRepository.save(rec);
            }
            log.info("Recommendations generated for user {}: {} kept, {} in / {} out tokens",
                    userId, fresh.size(), response.inputTokens(), response.outputTokens());
            return state(userId);
        });
    }

    @Transactional
    public void dismiss(Long id) {
        Long userId = authService.authenticatedId();
        claim(id, userId, RecommendationStatus.DISMISSED);
        log.info("Recommendation {} dismissed by user {}", id, userId);
    }

    @Transactional
    public UserMediaDTO add(Long id) {
        User user = authService.authenticated();
        claim(id, user.getId(), RecommendationStatus.ADDED);

        MediaRecommendation rec = recommendationRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Recommendation not found."));
        Status planned = statusRepository.findAllSystem().stream()
                .filter(s -> PLANNED_STATUS.equals(s.getName()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Status not found."));

        // Só título e tipo; privada, para a sugestão não aparecer no perfil público sem o usuário decidir.
        UserMediaDTO created = userMediaService.create(new UserMediaSaveDTO(
                rec.getTitle(), rec.getMediaType().getId(), planned.getId(),
                null, null, null, null, null, null, null, null, Visibility.PRIVATE, false, null));
        rec.setUserMedia(userMediaRepository.getReferenceById(created.id()));
        log.info("Recommendation {} added as media {} by user {}", id, created.id(), user.getUsername());
        return created;
    }

    private RecommendationsDTO state(Long userId) {
        boolean enabled = llmProvider.getIfAvailable() != null;
        List<RecommendationBatch> window = recentBatches(userId);
        int remaining = Math.max(0, DAILY_LIMIT - window.size());
        Instant nextAvailableAt = remaining > 0 ? null
                : window.get(window.size() - DAILY_LIMIT).getCreatedAt().plus(WINDOW);
        boolean eligible = userMediaRepository.countLikedEntries(userId, MIN_LIKED_RATING) >= MIN_LIKED_ENTRIES;
        List<RecommendationDTO> items = recommendationRepository.findByUserIdAndStatus(userId, RecommendationStatus.PENDING)
                .stream().map(this::toDTO).toList();
        return new RecommendationsDTO(enabled, eligible, remaining, nextAvailableAt, items);
    }

    private RecommendationInput input(Long userId, List<MediaType> types, String language) {
        List<LibraryEntryDTO> liked = userMediaRepository.findLikedEntries(
                userId, MIN_LIKED_RATING, PageRequest.of(0, RecommendationPromptBuilder.MAX_LIKED));
        List<LibraryEntryDTO> avoid = userMediaRepository.findAvoidEntries(
                userId, MAX_AVOID_RATING, PageRequest.of(0, RecommendationPromptBuilder.MAX_AVOID));
        List<String> known = userMediaRepository.findRecentTitles(
                userId, PageRequest.of(0, RecommendationPromptBuilder.MAX_KNOWN));
        List<String> dismissed = recommendationRepository.findDismissedTitles(
                userId, PageRequest.of(0, RecommendationPromptBuilder.MAX_DISMISSED));
        return new RecommendationInput(liked, avoid, known, dismissed,
                types.stream().map(MediaType::getName).toList(), language);
    }

    private RecommendationBatch reserve(User user, String libraryHash) {
        return transaction.execute(s -> {
            userRepository.findByIdForUpdate(user.getId());
            if (recentBatches(user.getId()).size() >= DAILY_LIMIT)
                throw new AIRateLimitException("Daily recommendation limit reached. Try again later.");
            RecommendationBatch batch = new RecommendationBatch();
            batch.setUser(user);
            batch.setLibraryHash(libraryHash);
            batch.setModel(PENDING_MODEL);
            return batchRepository.save(batch);
        });
    }

    private List<RecommendationBatch> recentBatches(Long userId) {
        return batchRepository.findByUserIdAndCreatedAtAfterOrderByCreatedAtAsc(userId, Instant.now().minus(WINDOW));
    }

    /** Resposta única por sugestão: se outra chamada (ou outro usuário) chegou antes, vira "não encontrada". */
    private void claim(Long id, Long userId, RecommendationStatus to) {
        if (recommendationRepository.changeStatus(id, userId, RecommendationStatus.PENDING, to) == 0)
            throw new ResourceNotFoundException("Recommendation not found.");
    }

    private RecommendationDTO toDTO(MediaRecommendation r) {
        MediaType t = r.getMediaType();
        MediaTypeDTO type = new MediaTypeDTO(t.getId(), t.getName(), t.getIsSystem(),
                t.getUser() != null ? t.getUser().getId() : null, t.getCreatedAt());
        return new RecommendationDTO(r.getId(), r.getTitle(), type, r.getReason(), r.getBasedOn());
    }

    private String key(String text) {
        return text.toLowerCase(Locale.ROOT);
    }
}
