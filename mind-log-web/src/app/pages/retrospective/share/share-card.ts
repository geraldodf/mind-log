/**
 * Desenho da imagem de compartilhar (1080 × 1920, formato de story) numa `<canvas>`, sem biblioteca.
 * Recebe um modelo com os textos já traduzidos: aqui só há geometria e cor. As cores saem das variáveis
 * `--ml-*` (fonte única da paleta) e a imagem é sempre escura, nos dois temas, para sair igual em qualquer tela.
 */
export interface ShareCardModel {
  year: number;
  lead: string;
  total: number;
  unit: string;
  typesHeading: string;
  types: { label: string; count: number }[];
  /** Pares rótulo/valor lado a lado (mês mais ativo, nota média, sentimentos). */
  tiles: { label: string; value: string }[];
  titlesHeading: string;
  /** Vazio quando quem compartilha escondeu os títulos. */
  titles: string[];
  footer: string;
}

export const SHARE_CARD_WIDTH = 1080;
export const SHARE_CARD_HEIGHT = 1920;

const DISPLAY = '"Space Grotesk Variable", "Inter Variable", system-ui, sans-serif';
const SANS = '"Inter Variable", system-ui, sans-serif';
const LEFT = 120;
const CONTENT_WIDTH = SHARE_CARD_WIDTH - 2 * LEFT;
const BLOCK_GAP = 56;
const BLOCKS_TOP = 930;
const BLOCKS_BOTTOM = 1790;
const TYPE_ROW = 96;
const TILE_HEIGHT = 168;
const TILE_GAP = 24;
const TITLE_ROW = 64;

interface Block {
  height: number;
  draw: (ctx: CanvasRenderingContext2D, top: number) => void;
}

/** Canal RGB de um token (`--ml-primary-500: 6 182 212`) como `rgba(...)`. */
function token(name: string, alpha = 1): string {
  const channels = getComputedStyle(document.documentElement).getPropertyValue(name).trim().split(/\s+/);
  return channels.length === 3 ? `rgba(${channels.join(', ')}, ${alpha})` : `rgba(255, 255, 255, ${alpha})`;
}

function loadMascot(svg: string): Promise<HTMLImageElement | null> {
  // O desenho é um SVG sem largura nem altura; sem elas o `drawImage` cai no tamanho padrão de 300 × 150.
  const sized = svg.replace('<svg ', '<svg width="160" height="150" ');
  const url = URL.createObjectURL(new Blob([sized], { type: 'image/svg+xml' }));
  return new Promise(resolve => {
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    image.src = url;
  });
}

async function loadFonts(): Promise<void> {
  try {
    await Promise.all([
      document.fonts.load(`700 100px ${DISPLAY}`),
      document.fonts.load(`600 40px ${SANS}`),
      document.fonts.load(`400 40px ${SANS}`),
    ]);
  } catch {
    // Sem as fontes da marca a imagem sai com a fonte do sistema, que ainda é legível.
  }
}

/** Corta o texto com reticências até caber em `maxWidth`. */
function fit(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let end = text.length;
  while (end > 1 && ctx.measureText(text.slice(0, end) + '…').width > maxWidth) end--;
  return text.slice(0, end).trimEnd() + '…';
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

function brandGradient(ctx: CanvasRenderingContext2D, x0: number, x1: number): CanvasGradient {
  const gradient = ctx.createLinearGradient(x0, 0, x1, 0);
  gradient.addColorStop(0, token('--ml-primary-400'));
  gradient.addColorStop(1, token('--ml-secondary-400'));
  return gradient;
}

function paintBackground(ctx: CanvasRenderingContext2D): void {
  const base = ctx.createLinearGradient(0, 0, 0, SHARE_CARD_HEIGHT);
  base.addColorStop(0, token('--ml-primary-950'));
  base.addColorStop(0.55, token('--ml-neutral-950'));
  base.addColorStop(1, token('--ml-neutral-950'));
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT);

  const glow = ctx.createRadialGradient(540, 240, 0, 540, 240, 760);
  glow.addColorStop(0, token('--ml-primary-500', 0.28));
  glow.addColorStop(1, token('--ml-primary-500', 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT);
}

function typesBlock(m: ShareCardModel): Block | null {
  if (m.types.length === 0) return null;
  const max = Math.max(...m.types.map(t => t.count), 1);
  return {
    height: m.types.length * TYPE_ROW,
    draw: (ctx, top) => {
      m.types.forEach((type, i) => {
        const y = top + i * TYPE_ROW;
        ctx.textBaseline = 'alphabetic';
        ctx.font = `600 40px ${SANS}`;
        ctx.fillStyle = token('--ml-neutral-50');
        ctx.textAlign = 'left';
        ctx.fillText(fit(ctx, type.label, CONTENT_WIDTH - 120), LEFT, y + 36);
        ctx.textAlign = 'right';
        ctx.fillStyle = token('--ml-neutral-300');
        ctx.fillText(String(type.count), LEFT + CONTENT_WIDTH, y + 36);

        ctx.fillStyle = token('--ml-neutral-50', 0.12);
        roundRect(ctx, LEFT, y + 56, CONTENT_WIDTH, 16, 8);
        ctx.fill();
        ctx.fillStyle = brandGradient(ctx, LEFT, LEFT + CONTENT_WIDTH);
        roundRect(ctx, LEFT, y + 56, Math.max(16, (CONTENT_WIDTH * type.count) / max), 16, 8);
        ctx.fill();
      });
    },
  };
}

function tilesBlock(m: ShareCardModel): Block | null {
  if (m.tiles.length === 0) return null;
  const width = (CONTENT_WIDTH - TILE_GAP * (m.tiles.length - 1)) / m.tiles.length;
  return {
    height: TILE_HEIGHT,
    draw: (ctx, top) => {
      m.tiles.forEach((tile, i) => {
        const x = LEFT + i * (width + TILE_GAP);
        ctx.fillStyle = token('--ml-neutral-50', 0.07);
        roundRect(ctx, x, top, width, TILE_HEIGHT, 28);
        ctx.fill();
        ctx.textAlign = 'left';
        ctx.font = `400 28px ${SANS}`;
        ctx.fillStyle = token('--ml-neutral-300');
        ctx.fillText(fit(ctx, tile.label, width - 48), x + 24, top + 52);
        ctx.font = `700 42px ${DISPLAY}`;
        ctx.fillStyle = token('--ml-neutral-50');
        ctx.fillText(fit(ctx, tile.value, width - 48), x + 24, top + 120);
      });
    },
  };
}

function titlesBlock(m: ShareCardModel): Block | null {
  if (m.titles.length === 0) return null;
  return {
    height: 56 + m.titles.length * TITLE_ROW,
    draw: (ctx, top) => {
      ctx.textAlign = 'left';
      ctx.font = `600 30px ${SANS}`;
      ctx.fillStyle = token('--ml-neutral-300');
      ctx.fillText(m.titlesHeading.toUpperCase(), LEFT, top + 30);
      m.titles.forEach((title, i) => {
        ctx.font = `600 44px ${SANS}`;
        ctx.fillStyle = token('--ml-neutral-50');
        ctx.fillText(fit(ctx, title, CONTENT_WIDTH), LEFT, top + 56 + i * TITLE_ROW + 44);
      });
    },
  };
}

/** Desenha o cartão inteiro. `mascotSvg` é a arte do mascote (SVG em texto); sem ela o cartão sai sem o desenho. */
export async function drawShareCard(canvas: HTMLCanvasElement, m: ShareCardModel, mascotSvg: string): Promise<void> {
  canvas.width = SHARE_CARD_WIDTH;
  canvas.height = SHARE_CARD_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is not available.');

  const [, mascot] = await Promise.all([loadFonts(), loadMascot(mascotSvg)]);
  paintBackground(ctx);

  if (mascot) ctx.drawImage(mascot, 540 - 128, 130, 256, 240);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `700 180px ${DISPLAY}`;
  ctx.fillStyle = brandGradient(ctx, 340, 740);
  ctx.fillText(String(m.year), 540, 560);

  ctx.font = `600 44px ${SANS}`;
  ctx.fillStyle = token('--ml-neutral-200');
  ctx.fillText(m.lead, 540, 630);

  ctx.font = `700 170px ${DISPLAY}`;
  ctx.fillStyle = token('--ml-neutral-50');
  ctx.fillText(String(m.total), 540, 820);
  ctx.font = `600 48px ${SANS}`;
  ctx.fillStyle = token('--ml-neutral-300');
  ctx.fillText(m.unit, 540, 880);

  const blocks = [typesBlock(m), tilesBlock(m), titlesBlock(m)].filter((b): b is Block => b !== null);
  const used = blocks.reduce((sum, b) => sum + b.height, 0) + BLOCK_GAP * Math.max(0, blocks.length - 1);
  let top = BLOCKS_TOP + Math.max(0, (BLOCKS_BOTTOM - BLOCKS_TOP - used) / 2);
  for (const block of blocks) {
    block.draw(ctx, top);
    top += block.height + BLOCK_GAP;
  }

  ctx.textAlign = 'center';
  ctx.font = `600 36px ${DISPLAY}`;
  ctx.fillStyle = token('--ml-neutral-400');
  ctx.fillText(m.footer, 540, 1860);
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not encode the image.')), 'image/png'));
}
