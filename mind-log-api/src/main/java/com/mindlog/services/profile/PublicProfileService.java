package com.mindlog.services.profile;

import com.mindlog.data.dtos.profile.PublicProfileDTO;
import com.mindlog.data.dtos.usermedia.UserMediaDTO;
import com.mindlog.data.enums.Visibility;
import com.mindlog.data.models.User;
import com.mindlog.repositories.FollowRepository;
import com.mindlog.repositories.UserMediaRepository;
import com.mindlog.repositories.UserRepository;
import com.mindlog.services.exceptions.ResourceNotFoundException;
import com.mindlog.services.usermedia.UserMediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PublicProfileService {

    private final UserRepository userRepository;
    private final UserMediaRepository userMediaRepository;
    private final FollowRepository followRepository;
    private final UserMediaService userMediaService;

    public PublicProfileDTO getProfile(String username) {
        User user = userRepository.findUserByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found."));
        long followers = followRepository.countByFollowingId(user.getId());
        long following = followRepository.countByFollowerId(user.getId());
        long publicMedia = userMediaRepository.countByUserIdAndVisibility(user.getId(), Visibility.PUBLIC);
        return new PublicProfileDTO(user.getId(), user.getUsername(), user.getName(), user.getPicture(), followers, following, publicMedia, user.getCreatedAt());
    }

    public Page<UserMediaDTO> getPublicMedia(String username, Long mediaTypeId, Long statusId, Pageable pageable) {
        User user = userRepository.findUserByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found."));
        return userMediaRepository.findPublicByUserIdFiltered(user.getId(), mediaTypeId, statusId, pageable)
                .map(userMediaService::toDTO);
    }
}
