package com.mindlog.data.dtos.user;

import jakarta.validation.constraints.*;


public record UserProfileUpdateDTO(
        @NotBlank(message = "Campo Nome é obrigatório.")
        @Size(min = 5, max = 255, message = "É necessário informar um nome entre 5 e 255 caracteres.")
        String name,

        @NotBlank(message = "Campo Username é obrigatório.")
        @Size(min = 4, max = 255, message = "É necessário informar um username entre 4 e 255 caracteres.")
        String username,

        @NotBlank(message = "Campo Email é obrigatório.")
        @Size(min = 5, max = 255, message = "É necessário informar um email entre 5 e 255 caracteres.")
        @Email(message = "É necessário informar um e-mail válido.")
        String email
){
}
