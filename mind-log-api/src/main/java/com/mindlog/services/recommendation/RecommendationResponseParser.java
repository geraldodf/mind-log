package com.mindlog.services.recommendation;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mindlog.data.dtos.recommendation.ValidRecommendation;
import com.mindlog.services.exceptions.AIResponseParseException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Valida a saída do modelo como dado não confiável. Nada vindo dele vira ação: o que não
 * passa em todas as regras é descartado, e só {@link ValidRecommendation} segue adiante.
 */
@Component
@RequiredArgsConstructor
public class RecommendationResponseParser {

    private static final Pattern LINK = Pattern.compile(
            "(?i)(https?:|://|www\\.|javascript:|data:|\\]\\(|\\b[a-z0-9-]+\\.(com|net|org|io|dev|app|co|xyz|ly|me|tv|info|br|ru|cn|tk)\\b)");
    private static final int REASON_LIMIT = 200;

    private final ObjectMapper mapper;

    /**
     * @param allowedTypes   nomes (já higienizados) que o campo {@code type} pode ter
     * @param likedTitles    títulos enviados em {@code liked}: único universo válido para {@code based_on}
     * @param excludedTitles títulos que não podem ser sugeridos (biblioteca, descartados, base do gosto)
     */
    public record Context(List<String> allowedTypes, Set<String> likedTitles, Set<String> excludedTitles) {
    }

    public List<ValidRecommendation> parse(String json, Context context) {
        JsonNode root;
        try {
            root = mapper.readTree(json);
        } catch (JsonProcessingException e) {
            throw new AIResponseParseException("The AI response was not valid JSON.");
        }
        JsonNode items = root == null ? null : root.get("recommendations");
        if (items == null || !items.isArray())
            throw new AIResponseParseException("The AI response did not follow the expected format.");

        List<ValidRecommendation> result = new ArrayList<>();
        Set<String> seen = new LinkedHashSet<>();
        for (JsonNode item : items) {
            ValidRecommendation valid = validate(item, context);
            if (valid == null || !seen.add(key(valid.title()))) continue;
            result.add(valid);
            if (result.size() == RecommendationPromptBuilder.MAX_RESULTS) break;
        }
        return result;
    }

    private ValidRecommendation validate(JsonNode item, Context context) {
        if (item == null || !item.isObject()) return null;

        String title = cleanText(item.get("title"), RecommendationPromptBuilder.MAX_TITLE);
        String reason = cleanText(item.get("reason"), REASON_LIMIT);
        String type = canonicalType(item.get("type"), context.allowedTypes());
        if (title == null || reason == null || type == null) return null;
        if (contains(context.excludedTitles(), title)) return null;

        List<String> basedOn = basedOn(item.get("based_on"), context.likedTitles());
        if (basedOn.isEmpty()) return null;

        return new ValidRecommendation(title, type, reason, basedOn);
    }

    /** Texto que já estaria limpo se o modelo tivesse obedecido: se a higienização mudou algo, descarta. */
    private String cleanText(JsonNode node, int max) {
        if (node == null || !node.isTextual()) return null;
        String raw = node.asText();
        if (raw.codePoints().anyMatch(Character::isISOControl)) return null;
        String clean = RecommendationPromptBuilder.sanitize(raw, max + 1);
        if (clean.isEmpty() || clean.length() > max) return null;
        String expected = Normalizer.normalize(raw, Normalizer.Form.NFKC).strip().replaceAll("(?U)\\s+", " ");
        if (!clean.equals(expected)) return null;
        if (LINK.matcher(clean).find()) return null;
        return clean;
    }

    private String canonicalType(JsonNode node, List<String> allowedTypes) {
        if (node == null || !node.isTextual()) return null;
        String wanted = key(RecommendationPromptBuilder.sanitize(node.asText(), RecommendationPromptBuilder.MAX_TITLE));
        return allowedTypes.stream().filter(t -> key(t).equals(wanted)).findFirst().orElse(null);
    }

    private List<String> basedOn(JsonNode node, Set<String> likedTitles) {
        List<String> result = new ArrayList<>();
        if (node == null || !node.isArray()) return result;
        for (JsonNode n : node) {
            if (!n.isTextual()) continue;
            String wanted = key(RecommendationPromptBuilder.sanitize(n.asText(), RecommendationPromptBuilder.MAX_TITLE));
            likedTitles.stream().filter(t -> key(t).equals(wanted)).findFirst()
                    .filter(t -> !result.contains(t)).ifPresent(result::add);
            if (result.size() == 3) break;
        }
        return result;
    }

    private boolean contains(Set<String> titles, String title) {
        String wanted = key(title);
        return titles.stream().anyMatch(t -> key(t).equals(wanted));
    }

    private String key(String text) {
        return text.toLowerCase(Locale.ROOT);
    }
}
