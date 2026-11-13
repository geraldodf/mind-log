# Mascote do MindLog

O mascote é o **Nó** (conceito A, decisão do dono em 2026-11-12): o anel do logo com rosto, e as três linhas de
registro que saem do nó no glifo fazem os gestos. O nome do personagem ainda não foi escolhido; no código ele é
`mascot`. Dentro do app o mascote nunca fala de si.

- `mascot.js` é a fonte única de todo desenho:
  - partes e medidas, em frações de R (o raio da cabeça);
  - cores, todas tokens `--ml-*` mais a tinta dos traços do rosto;
  - as poses;
  - o CSS de animação (`MASCOT_CSS`), feito com os tokens de movimento do app.
- `model-sheet.html`: regras de construção, repertório de partes e o que não fazer.
- `playbook.html`: personalidade, voz, quando aparece e quando fica fora, e a tabela de **todos os lugares** onde
  ele aparece, com pose e texto.
- As duas páginas carregam `mascot.js`. As cópias `.static.html` já trazem os desenhos, para abrir sem JavaScript.
- `svg/` e `png/`: cada pose, a cabeça e o avatar de rede (PNG com 512 e 1024 px de altura, fundo transparente,
  menos o avatar).

| Pose | Arquivo | Onde aparece |
|---|---|---|
| Acenando | `mindlog-mascot-wave` | boas-vindas (onboarding), Pessoas antes de buscar |
| Nada registrado | `mindlog-mascot-empty` | listas vazias de primeiro uso |
| Linhas embaraçadas | `mindlog-mascot-error` | falha de carga |
| Comemorando | `mindlog-mascot-celebrate` | nada pendente (notificações em dia) |
| Procurando | `mindlog-mascot-search` | busca ou filtro sem resultado, perfil inexistente, 404 |

No app ele entra só pelo `app-empty-state` (prop `pose`, mascote ligado por padrão) e pelo `app-load-error`;
administração usa `[mascot]="false"` e mostra ícone. O componente é `shared/ui/mascot` (`app-mascot`).

Nunca edite à mão os arquivos exportados, as páginas estáticas nem o `mascot-art.generated.ts`: mude
`mascot.js` ou uma página e gere de novo. De `mind-log-web`:

```
node brand/mascot/build.js
```

Os PNG saem do Chrome ou do Edge instalados (modo headless); sem nenhum dos dois, o build gera só os SVG.

Pose nova combina partes que já existem em `mascot.js`. Parte nova entra antes no repertório do model sheet.
Esta pasta fica fora de `src/assets`: nada daqui é servido. Copie para lá só o arquivo que o app passar a usar.
