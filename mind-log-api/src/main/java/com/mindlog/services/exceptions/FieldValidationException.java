package com.mindlog.services.exceptions;

import lombok.Getter;

/**
 * Regra violada num campo específico do formulário (e-mail em uso, senha atual errada...).
 * Vai para o cliente com {@code field} e {@code code} estáveis: a tela põe a mensagem no campo
 * certo e traduz pelo código, em vez de mostrar o texto do servidor (que tem um idioma só).
 * A mensagem continua aqui para log e para clientes que não conhecem o código.
 */
@Getter
public class FieldValidationException extends IllegalArgumentException {

    private final String field;
    private final String code;

    public FieldValidationException(String field, String code, String message) {
        super(message);
        this.field = field;
        this.code = code;
    }
}
