package com.mindlog.data.dtos.recommendation;

import java.util.List;

/** Sugestão que passou por toda a validação; só isto chega ao banco. */
public record ValidRecommendation(String title, String typeName, String reason, List<String> basedOn) {
}
