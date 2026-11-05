package com.mindlog.data.dtos.usermedia;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record PlannedOrderDTO(
        @NotEmpty List<@NotNull Long> ids
) {}
