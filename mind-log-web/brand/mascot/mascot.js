/* Mascote do MindLog (conceito A · Nó): o nó do logo com rosto, e as três linhas de registro que saem
 * dele no glifo fazem os gestos. Fonte única de todo desenho: carregado por model-sheet.html e
 * playbook.html (<script src>) e por build.js, que gera as exportações e a arte do app.
 * Toda medida é fração de R, o raio da cabeça (o anel do logo). No logo o anel tem r = 8,5 num quadro de
 * 64 e as linhas ficam a ±0,94 R; aqui a cabeça é maior que no glifo para caber rosto, então as linhas
 * sobem para ±0,6 R e mantêm a proporção 14 : 11 : 14 de comprimento. */
const TOKENS = {
  cyan: '#06B6D4',      // --ml-primary-500 (início do gradiente da marca)
  cyanDeep: '#0E7490',  // --ml-primary-700
  violet: '#8B5CF6',    // --ml-secondary-500 (fim do gradiente)
  violetDeep: '#6D28D9',// --ml-secondary-700
  ghost: '#94A3B8',     // --ml-neutral-400: linha que ainda não existe (vazio)
  ink: '#0B2533',       // tinta dos traços do rosto (ciano quase preto)
  white: '#FFFFFF'
};
const R = 30, CX = 62, CY = 74;
const M = {
  ring: 0.3 * R,                 // espessura do anel (o traço do logo, mais grosso para ler pequeno)
  line: 0.26 * R,                // espessura das linhas de registro
  lineGap: 0.5 * R,              // distância da borda do anel até o início das linhas
  lineDy: 0.6 * R,               // afastamento vertical das linhas de cima e de baixo
  lineLong: 0.82 * R, lineShort: 0.65 * R,
  eyeX: 0.32 * R, eyeY: -0.1 * R, mouthY: 0.3 * R, browY: -0.42 * R,
  feature: 3
};
const BODY_VB = '0 0 160 150', HEAD_VB = '24 36 76 76';
const lineX0 = CX + R + M.ring / 2 + M.lineGap;
const LINES = [
  { y: CY - M.lineDy, len: M.lineLong },
  { y: CY, len: M.lineShort },
  { y: CY + M.lineDy, len: M.lineLong }
];
let uid = 0;
const f = n => Math.round(n * 10) / 10;
const svg = (vb, body, label, w, h, cls) => `<svg viewBox="${vb}" ${w ? `width="${w}" height="${h || w}"` : ''} ${cls ? `class="${cls}"` : ''} role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
const stroke = (d, col, w, extra = '') => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;

/* ---------- Rosto ---------- */
const EYES = {
  open: (c) => [-1, 1].map(s => `<ellipse cx="${f(CX + s * M.eyeX)}" cy="${f(CY + M.eyeY)}" rx="3.4" ry="4.4" fill="${c.ink}"/><circle cx="${f(CX + s * M.eyeX + 1.2)}" cy="${f(CY + M.eyeY - 1.8)}" r="1.2" fill="#fff"/>`).join(''),
  down: (c) => [-1, 1].map(s => `<ellipse cx="${f(CX + s * M.eyeX)}" cy="${f(CY + M.eyeY + 2.4)}" rx="3.2" ry="3.6" fill="${c.ink}"/>`).join(''),
  side: (c) => [-1, 1].map(s => `<ellipse cx="${f(CX + s * M.eyeX + 2.6)}" cy="${f(CY + M.eyeY)}" rx="3.4" ry="4.4" fill="${c.ink}"/><circle cx="${f(CX + s * M.eyeX + 3.8)}" cy="${f(CY + M.eyeY - 1.8)}" r="1.2" fill="#fff"/>`).join(''),
  happy: (c) => stroke([-1, 1].map(s => { const x = CX + s * M.eyeX, y = CY + M.eyeY + 1; return `M${f(x - 4.6)} ${f(y)}Q${f(x)} ${f(y - 5.6)} ${f(x + 4.6)} ${f(y)}`; }).join(''), c.ink, M.feature)
};
const MOUTHS = {
  smile: (c) => stroke(`M${f(CX - 7)} ${f(CY + M.mouthY - 1)}Q${CX} ${f(CY + M.mouthY + 5)} ${f(CX + 7)} ${f(CY + M.mouthY - 1)}`, c.ink, M.feature),
  flat: (c) => stroke(`M${f(CX - 4)} ${f(CY + M.mouthY + 1)}H${f(CX + 4)}`, c.ink, M.feature),
  wavy: (c) => stroke(`M${f(CX - 7.5)} ${f(CY + M.mouthY + 1)}q2.5-2.5 5 0t5 0t5 0`, c.ink, 2.6),
  laugh: (c) => `<path d="M${f(CX - 8)} ${f(CY + M.mouthY - 3)}Q${CX} ${f(CY + M.mouthY + 9)} ${f(CX + 8)} ${f(CY + M.mouthY - 3)}Z" fill="${c.violetDeep}" stroke="${c.ink}" stroke-width="2" stroke-linejoin="round"/>`,
  o: (c) => `<ellipse cx="${CX}" cy="${f(CY + M.mouthY + 1)}" rx="2.8" ry="3.4" fill="${c.violetDeep}" stroke="${c.ink}" stroke-width="2"/>`
};
const BROWS = {
  none: () => '',
  worried: (c) => stroke(`M${f(CX - M.eyeX - 5)} ${f(CY + M.browY + 2)}l8-3M${f(CX + M.eyeX + 5)} ${f(CY + M.browY + 2)}l-8-3`, c.ink, M.feature),
  raised: (c) => stroke([-1, 1].map(s => { const x = CX + s * M.eyeX, y = CY + M.browY; return `M${f(x - 4)} ${f(y + 1)}Q${f(x)} ${f(y - 2.4)} ${f(x + 4)} ${f(y + 1)}`; }).join(''), c.ink, M.feature)
};

/* ---------- Linhas de registro (o gesto) ---------- */
/* Cada pose diz o que cada uma das três linhas faz. `rot` gira em volta do início da linha. */
const lineD = (l, rot = 0, lenK = 1) => {
  const a = rot * Math.PI / 180, len = l.len * lenK;
  return `M${f(lineX0)} ${f(l.y)}L${f(lineX0 + Math.cos(a) * len)} ${f(l.y + Math.sin(a) * len)}`;
};
const LINE_SETS = {
  rest: (g) => LINES.map(l => stroke(lineD(l), `url(#${g})`, M.line)).join(''),
  wave: (g) => stroke(lineD(LINES[0], -42), `url(#${g})`, M.line, 'class="m-line-wave"') + stroke(lineD(LINES[1]), `url(#${g})`, M.line) + stroke(lineD(LINES[2]), `url(#${g})`, M.line),
  empty: (_g, c) => `<g class="m-line-ghost">` + LINES.map(l => stroke(lineD(l), c.ghost, M.line - 2, 'stroke-dasharray="0.1 7"')).join('') + `</g>`,
  error: (g) => stroke(lineD(LINES[0]), `url(#${g})`, M.line)
    + stroke(`M${f(lineX0)} ${f(CY)}l4.6 -4l4.6 7l4.6 -6l4 3`, `url(#${g})`, M.line - 1, 'class="m-line-tangle"')
    + stroke(lineD(LINES[2], 34, 0.82), `url(#${g})`, M.line, 'stroke-dasharray="11 5"'),
  celebrate: (g) => `<g class="m-line-rays">` + [[-58, 0.95], [-30, 1.05], [-4, 1]].map(([rot, k], i) => stroke(lineD(LINES[i], rot, k), `url(#${g})`, M.line)).join('') + `</g>`,
  search: (g, c) => {
    const l = LINES[0], a = -30 * Math.PI / 180, ex = lineX0 + Math.cos(a) * l.len, ey = l.y + Math.sin(a) * l.len;
    return `<g class="m-line-lens">` + stroke(lineD(l, -30), `url(#${g})`, M.line)
      + `<circle cx="${f(ex + 5)}" cy="${f(ey - 5)}" r="7.5" fill="${c.white}" fill-opacity=".85" stroke="url(#${g})" stroke-width="${f(M.line - 2.5)}"/></g>`
      + stroke(lineD(LINES[1]), `url(#${g})`, M.line) + stroke(lineD(LINES[2]), `url(#${g})`, M.line);
  }
};

/* ---------- Adereços ---------- */
const star = (x, y, s, fill) => { const k = s * 0.3; return `<path d="M${x} ${y - s}L${x + k} ${y - k}L${x + s} ${y}L${x + k} ${y + k}L${x} ${y + s}L${x - k} ${y + k}L${x - s} ${y}L${x - k} ${y - k}Z" fill="${fill}"/>`; };
const PROPS = {
  none: () => '',
  waveMarks: (c) => stroke(`M${f(lineX0 + 30)} ${f(CY - 44)}q5 4 4 10`, c.ghost, 2.4, 'class="m-prop"'),
  sparkles: (c) => `<g class="m-prop m-prop-sparkles">${star(lineX0 + 34, CY - 52, 7, c.violet)}${star(24, CY - 40, 5, c.cyan)}${star(lineX0 + 40, CY + 6, 4, c.violet)}</g>`
};

/* ---------- Corpo ----------
 * Cabeça = o anel do logo (gradiente ciano → violeta) com miolo branco; sem corpo nem membros: o
 * personagem é o glifo. Sombra no chão só no corpo inteiro. */
function mascot(o = {}) {
  const c = TOKENS, g = 'mlg' + (uid++);
  const pose = { eyes: 'open', mouth: 'smile', brows: 'none', lines: 'rest', prop: 'none', dy: 0, ...o };
  // userSpaceOnUse: em objectBoundingBox um traço horizontal (altura zero) não recebe o gradiente e some.
  const defs = `<defs><linearGradient id="${g}" gradientUnits="userSpaceOnUse" x1="${CX - R}" y1="${CY - R}" x2="${f(lineX0 + M.lineLong)}" y2="${CY + R}"><stop offset="0" stop-color="${c.cyan}"/><stop offset="1" stop-color="${c.violet}"/></linearGradient></defs>`;
  const head = `<g class="m-head"><circle cx="${CX}" cy="${CY}" r="${R}" fill="${c.white}" stroke="url(#${g})" stroke-width="${M.ring}"/>`
    + `<g class="m-eyes">${EYES[pose.eyes](c)}</g>${BROWS[pose.brows](c)}${MOUTHS[pose.mouth](c)}</g>`;
  if (pose.headOnly) return defs + head;
  const shadow = `<ellipse class="m-shadow" cx="${CX + 18}" cy="140" rx="46" ry="4" fill="${c.ink}" opacity=".1"/>`;
  return defs + shadow + `<g class="m-body" transform="translate(0 ${pose.dy})">${head}<g class="m-lines">${LINE_SETS[pose.lines](g, c)}</g></g>` + PROPS[pose.prop](c);
}

/* ---------- Poses ---------- */
const POSES = {
  wave: { name: 'acenando', o: { lines: 'wave', prop: 'waveMarks' } },
  empty: { name: 'nada registrado', o: { eyes: 'down', mouth: 'flat', lines: 'empty' } },
  error: { name: 'linhas embaraçadas', o: { brows: 'worried', mouth: 'wavy', lines: 'error' } },
  celebrate: { name: 'comemorando', o: { eyes: 'happy', mouth: 'laugh', lines: 'celebrate', prop: 'sparkles', dy: -6 } },
  search: { name: 'procurando', o: { eyes: 'side', brows: 'raised', mouth: 'o', lines: 'search' } }
};

/* ---------- Animação ----------
 * Laços são múltiplos dos tokens de movimento do app (--ml-dur-*), tocam 2 ou 3 vezes e param.
 * Só transform e opacity. Movimento reduzido: desenho parado. */
const MASCOT_CSS = `
.mascot{overflow:visible}
.mascot .m-body,.mascot .m-eyes,.mascot .m-lines path,.mascot .m-lines g,.mascot .m-prop,.mascot .m-shadow{transform-box:view-box}
.mascot.m-enter{animation:m-enter var(--ml-dur-enter) var(--ml-ease-enter) both}
.mascot .m-eyes{transform-origin:${CX}px ${f(CY + M.eyeY)}px;animation:m-blink calc(var(--ml-dur-shared) * 10) var(--ml-ease-inout) calc(var(--ml-dur-shared) * 4) 3}
.mascot-wave .m-line-wave{transform-origin:${f(lineX0)}px ${f(LINES[0].y)}px;animation:m-wave calc(var(--ml-dur-slow) * 2) var(--ml-ease-inout) var(--ml-dur-enter) 3}
.mascot-empty .m-line-ghost{animation:m-ghost calc(var(--ml-dur-shared) * 3) var(--ml-ease-inout) var(--ml-dur-enter) 3}
.mascot-error .m-line-tangle{transform-origin:${f(lineX0)}px ${CY}px;animation:m-wobble calc(var(--ml-dur-slow) * 2) var(--ml-ease-inout) 3}
.mascot-celebrate .m-body{animation:m-jump calc(var(--ml-dur-slow) * 2) var(--ml-ease-inout) 3}
.mascot-celebrate .m-shadow{transform-origin:${CX + 18}px 140px;animation:m-shadow calc(var(--ml-dur-slow) * 2) var(--ml-ease-inout) 3}
.mascot-celebrate .m-prop-sparkles{animation:m-twinkle calc(var(--ml-dur-shared) * 2) var(--ml-ease-inout) 3}
.mascot-search .m-line-lens{transform-origin:${f(lineX0)}px ${f(LINES[0].y)}px;animation:m-sweep calc(var(--ml-dur-shared) * 3) var(--ml-ease-inout) var(--ml-dur-enter) 2}
@keyframes m-enter{from{opacity:0;transform:translateY(8px) scale(.96)}to{opacity:1;transform:none}}
@keyframes m-blink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}
@keyframes m-wave{0%,100%{transform:rotate(0)}25%{transform:rotate(-16deg)}75%{transform:rotate(8deg)}}
@keyframes m-ghost{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes m-wobble{0%,100%{transform:rotate(0)}30%{transform:rotate(8deg)}70%{transform:rotate(-6deg)}}
@keyframes m-jump{0%,100%{transform:translateY(0)}45%{transform:translateY(-8px)}}
@keyframes m-shadow{0%,100%{transform:scaleX(1);opacity:.1}45%{transform:scaleX(.7);opacity:.05}}
@keyframes m-twinkle{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.9)}}
@keyframes m-sweep{0%,100%{transform:rotate(0)}30%{transform:rotate(-12deg)}70%{transform:rotate(6deg)}}
@media (prefers-reduced-motion: reduce){.mascot,.mascot *{animation:none!important}}
`;

if (typeof module !== 'undefined') module.exports = { mascot, POSES, svg, BODY_VB, HEAD_VB, TOKENS, MASCOT_CSS, M, R };
