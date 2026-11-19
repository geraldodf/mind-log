package com.mindlog.services.imports;

import com.mindlog.data.dtos.imports.ImportIssueDTO;

import java.util.List;

public record ParsedImport(List<ImportedEntry> entries, List<ImportIssueDTO> issues) {}
