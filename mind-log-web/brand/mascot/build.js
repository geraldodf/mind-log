// Gera todo arquivo do mascote a partir de mascot.js, a fonte única do desenho:
//   - <página>.static.html para cada página abaixo: a página com os desenhos e o CSS de animação já
//     embutidos, para quem abre sem JavaScript;
//   - src/app/shared/ui/mascot/mascot-art.generated.ts: as poses e o CSS que o app renderiza;
//   - svg/ e png/: cada pose, a cabeça e o avatar de rede social (PNG com 512 e 1024 px de altura).
// Rode de mind-log-web: node brand/mascot/build.js
// Os PNG saem do Edge ou do Chrome instalados (modo headless), sem dependência nova no projeto.
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const lib = require('./mascot.js');

const here = __dirname;
const PAGES = ['model-sheet', 'playbook'];
const library = fs.readFileSync(path.join(here, 'mascot.js'), 'utf8');

PAGES.forEach(buildStaticPage);
buildAppArt(lib);
buildPngs(buildSvgs(lib));

function buildStaticPage(name) {
  const source = path.join(here, name + '.html');
  if (!fs.existsSync(source)) return;
  let html = fs.readFileSync(source, 'utf8');
  const external = '<script src="mascot.js"></script>';
  const inline = html.match(/<script>([\s\S]*?)<\/script>/);
  if (!html.includes(external) || !inline) throw new Error(name + '.html precisa carregar mascot.js e ter um script inline');
  const filled = {};
  const document = { getElementById: (id) => ({ set innerHTML(value) { filled[id] = value; } }) };
  const vm = require('vm');
  vm.runInNewContext(library.replace(/if \(typeof module[\s\S]*$/, '') + '\n' + inline[1], { document, Math });
  html = html.replace(external, '').replace(inline[0], '');
  for (const [id, content] of Object.entries(filled)) {
    const container = new RegExp(`(<(div|ul|style|section|tbody)[^>]*id="${id}"[^>]*>)(</\\2>)`);
    if (!container.test(html)) throw new Error(`${name}: contêiner não encontrado: ${id}`);
    html = html.replace(container, (_, open, _tag, close) => open + content + close);
  }
  fs.writeFileSync(path.join(here, name + '.static.html'), html);
}

function buildAppArt({ mascot, POSES, svg, BODY_VB, HEAD_VB, MASCOT_CSS }) {
  const compact = (markup) => markup.replace(/\n\s*/g, '');
  const entries = Object.entries(POSES).map(([key, pose]) => {
    const cls = 'mascot mascot-' + key + ' m-enter';
    const body = compact(svg(BODY_VB, mascot(pose.o), pose.name, null, null, cls));
    const head = compact(svg(HEAD_VB, mascot({ ...pose.o, headOnly: true }), pose.name, null, null, cls));
    return `  ${key}: {\n    name: ${JSON.stringify(pose.name)},\n    body: ${JSON.stringify(body)},\n    head: ${JSON.stringify(head)},\n  },`;
  });
  const keys = Object.keys(POSES).map((k) => "'" + k + "'").join(' | ');
  const out = [
    '// Gerado por brand/mascot/build.js a partir de brand/mascot/mascot.js. Não edite à mão: mude mascot.js e rode o build.',
    'export type MascotPose = ' + keys + ';',
    '',
    'export interface MascotArt {',
    '  name: string;',
    '  body: string;',
    '  head: string;',
    '}',
    '',
    'export const MASCOT_ART: Record<MascotPose, MascotArt> = {',
    ...entries,
    '};',
    '',
    'export const MASCOT_CSS = ' + JSON.stringify(compact(MASCOT_CSS)) + ';',
    ''
  ].join('\n');
  const target = path.join(here, '..', '..', 'src', 'app', 'shared', 'ui', 'mascot', 'mascot-art.generated.ts');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, out);
}

function buildSvgs({ mascot, POSES, svg, BODY_VB, HEAD_VB, TOKENS }) {
  const [, , bw, bh] = BODY_VB.split(' ').map(Number);
  const list = [];
  for (const [key, pose] of Object.entries(POSES)) {
    const markup = svg(BODY_VB, mascot(pose.o), 'Mascote do MindLog, ' + pose.name, bw, bh);
    list.push({ name: 'mindlog-mascot-' + key, markup, aspect: bw / bh, transparent: true });
  }
  const head = svg(HEAD_VB, mascot({ headOnly: true }), 'Mascote do MindLog', 96, 96);
  list.push({ name: 'mindlog-mascot-head', markup: head, aspect: 1, transparent: true });
  // Avatar de rede: a cabeça num disco branco sobre o gradiente escuro da marca.
  const avatar = `<svg viewBox="0 0 120 120" width="120" height="120" role="img" aria-label="Mascote do MindLog" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="av" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${TOKENS.cyanDeep}"/><stop offset="1" stop-color="${TOKENS.violetDeep}"/></linearGradient></defs>
<rect width="120" height="120" fill="url(#av)"/><circle cx="60" cy="60" r="46" fill="#fff"/>
<svg x="20" y="20" width="80" height="80" viewBox="${HEAD_VB}">${mascot({ headOnly: true })}</svg></svg>`;
  list.push({ name: 'mindlog-mascot-avatar', markup: avatar, aspect: 1, transparent: false });
  fs.mkdirSync(path.join(here, 'svg'), { recursive: true });
  for (const d of list) fs.writeFileSync(path.join(here, 'svg', d.name + '.svg'), '<?xml version="1.0" encoding="UTF-8"?>\n' + d.markup.replace(/\n\s*/g, '\n'));
  return list;
}

function findBrowsers() {
  const candidates = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/chromium'
  ];
  return candidates.filter(p => fs.existsSync(p));
}

// O modo headless às vezes sai sem gravar o arquivo: tenta de novo e, se preciso, no outro navegador.
function screenshot(browsers, args, out) {
  for (let attempt = 0; attempt < 3; attempt++) {
    for (const browser of browsers) {
      if (fs.existsSync(out)) fs.rmSync(out);
      try { execFileSync(browser, [...args, `--screenshot=${out}`], { stdio: 'ignore' }); } catch { /* tenta o próximo */ }
      if (fs.existsSync(out)) return;
    }
  }
  throw new Error('não consegui gerar ' + out);
}

function buildPngs(list) {
  const browsers = findBrowsers();
  if (!browsers.length) {
    console.warn('Nenhum Edge/Chrome encontrado: SVGs gerados, PNGs não.');
    return;
  }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mindlog-mascot-'));
  fs.mkdirSync(path.join(here, 'png'), { recursive: true });
  for (const d of list) {
    for (const height of [512, 1024]) {
      const width = Math.round(height * d.aspect);
      const sized = d.markup.replace(/<svg([^>]*?) width="[^"]*" height="[^"]*"/, `<svg$1 width="${width}" height="${height}"`);
      const page = path.join(tmp, `${d.name}-${height}.html`);
      fs.writeFileSync(page, `<!doctype html><html><body style="margin:0;background:transparent;overflow:hidden">${sized}</body></html>`);
      const out = path.join(here, 'png', `${d.name}-${height}.png`);
      screenshot(browsers, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--window-size=${width},${height}`,
        '--default-background-color=00000000', 'file:///' + page.replace(/\\/g, '/')], out);
    }
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`gerados ${PAGES.map(p => p + '.static.html').join(', ')}, arte do app e ${list.length} desenhos (svg + png 512/1024)`);
}
