package com.mindlog.infra.ai;

/**
 * Porta para qualquer provedor de LLM. O resto do sistema só conhece esta interface:
 * trocar o provedor é configuração ({@code ai.provider}), não código de negócio.
 *
 * <p>Contrato: devolve JSON que obedece ao schema pedido. O provedor traduz as falhas do
 * SDK para as exceções {@code AI*} do projeto; ele <b>não</b> valida o conteúdo, e o
 * chamador deve tratar a resposta como dado não confiável.
 */
public interface LlmProvider {

    LlmResponse generateJson(LlmRequest request);
}
