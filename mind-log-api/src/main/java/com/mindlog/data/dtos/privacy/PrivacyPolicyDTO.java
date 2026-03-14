package com.mindlog.data.dtos.privacy;

import java.util.List;

public record PrivacyPolicyDTO(
        String lastUpdated,
        String applicationName,
        String contact,
        List<PolicySection> sections
) {
    public record PolicySection(String title, String content) {}
}
