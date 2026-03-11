package com.mindlog.data.dtos.user;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RoleDTO {

        @NotNull(message = "Campo ID da role é obrigatório.")
        private Long id;
        private String authority;

}

