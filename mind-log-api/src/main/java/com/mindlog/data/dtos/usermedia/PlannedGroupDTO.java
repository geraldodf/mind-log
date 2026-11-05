package com.mindlog.data.dtos.usermedia;

import com.mindlog.data.dtos.mediatype.MediaTypeDTO;

import java.util.List;

public record PlannedGroupDTO(
        MediaTypeDTO mediaType,
        List<UserMediaDTO> items
) {}
