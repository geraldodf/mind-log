package com.mindlog.data.dtos.imports;

import java.util.List;

public record ImportResultDTO(
        int imported,
        int duplicates,
        int invalid,
        List<ImportIssueDTO> issues,
        int issuesTotal
) {}
