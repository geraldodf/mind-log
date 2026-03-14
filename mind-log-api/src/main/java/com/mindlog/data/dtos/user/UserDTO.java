package com.mindlog.data.dtos.user;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private Long id;
    private String name;
    private String username;
    private String email;
    private String picture;
    private Boolean isEnabled;
    private List<RoleDTO> roles;
    private Instant createdAt;
}
