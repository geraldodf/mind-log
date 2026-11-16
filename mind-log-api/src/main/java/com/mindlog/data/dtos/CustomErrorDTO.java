package com.mindlog.data.dtos;

import java.time.Instant;

/**
 * Corpo de erro da API. {@code code} e {@code field} são opcionais: presentes quando o erro tem
 * um código estável (o cliente traduz por ele) e, se for de um campo, qual campo.
 */
public record CustomErrorDTO (
        Instant timestamp,
        Integer status,
        String error,
        String path,
        String code,
        String field
){
    public CustomErrorDTO(Instant timestamp, Integer status, String error, String path) {
        this(timestamp, status, error, path, null, null);
    }
}
