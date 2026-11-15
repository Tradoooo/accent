#!/usr/bin/env node
/**
 * Vérification visuelle locale (couche socle) : parcours Accueil → Diagnostic
 * avec micro bouchonné (oscillateur, même bouchon que tools/e2e-aide.mjs),
 * captures 1440×900 et 375×812. Chrome headless piloté en CDP brut (node:ws).
 * Usage : node outils-capture.mjs <url> <dossierSortie>
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const URL = process.argv[2] ?? 'http://localhost:4517/';
const OUT = process.argv[3] ?? 'captures';
mkdirSync(OUT, { recursive: true });

const DEBUG_PORT = 9333;
let msgId = 0;
const pendants = new Map();
let ws;

function send(method, params = {}, sessionId) {
  const id = ++msgId;
  return new Promise((resolve, reject) => {
    pendants.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    setTimeout(() => {
      if (pendants.has(id)) {
        pendants.delete(id);
        reject(new Error(`timeout CDP: ${method}`));
      }
    }, 30000);
  });
}

async function evaluer(expression, awaitPromise = false) {
  const r = await send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise,
  });
  if (r.exceptionDetails) {
    const d = r.exceptionDetails;
    const desc = d.exception?.description ?? d.exception?.value ?? d.text;
    throw new Error(`eval a échoué: ${desc}`);
  }
  return r.result?.value;
}

/** Audit de rendu d'un écran : couleurs, tailles, cibles tactiles, débordement. */
async function audit(nom) {
  const a = await evaluer(`(() => {
    const els = [...document.querySelectorAll('body *')];
    const rouge = els.filter((e) => {
      const c = getComputedStyle(e).color;
      return /rgb\\(229,\\s*72,\\s*77\\)/.test(c);
    }).map((e) => e.tagName + '.' + (e.className || '').toString().slice(0, 40));
    const petits = [...document.querySelectorAll('button')]
      .filter((b) => b.getBoundingClientRect().height > 0 && b.getBoundingClientRect().height < 47)
      .map((b) => (b.textContent || b.getAttribute('aria-label') || '').trim().slice(0, 30)
        + ' h=' + Math.round(b.getBoundingClientRect().height));
    const titre = document.querySelector('h1');
    const ts = titre ? getComputedStyle(titre) : null;
    return {
      titre: titre ? titre.textContent.slice(0, 60) : '',
      titrePx: ts ? ts.fontSize : '',
      titrePoids: ts ? ts.fontWeight : '',
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      largeur: document.documentElement.scrollWidth,
      rouge,
      petits,
      boutons: document.querySelectorAll('button').length,
    };
  })()`);
  console.log(`audit ${nom} : ${JSON.stringify(a)}`);
  return a;
}

const BOUCHON_MICRO = `(async () => {
  if (!navigator.mediaDevices) {
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: {} });
  }
  navigator.mediaDevices.getUserMedia = async () => {
    const ctx = new AudioContext();
    await ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    gain.gain.value = 0.4;
    const dest = ctx.createMediaStreamDestination();
    osc.connect(gain); gain.connect(dest); osc.start();
    return dest.stream;
  };
  return 'micro-bouchonne';
})()`;

const BOUCHON_TTS = `(() => {
  if (!('speechSynthesis' in window)) {
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: { speak: () => {}, cancel: () => {}, getVoices: () => [{ lang: 'en-US', name: 'test' }, { lang: 'fr-FR', name: 'test' }] },
    });
    window.SpeechSynthesisUtterance = function (t) { this.text = t; this.lang = ''; this.rate = 1; this.pitch = 1; this.volume = 1; };
  }
  return 'tts-ok';
})()`;

async function attendrePret() {
  for (let i = 0; i < 30; i++) {
    const etat = await evaluer(
      `document.readyState === 'complete' && Boolean(document.querySelector('#root') && document.querySelector('#root').children.length)`,
    );
    if (etat) return true;
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error('page jamais prête');
}

function clic(motif) {
  return evaluer(`(() => {
    const m = ${JSON.stringify(motif)};
    const el = [...document.querySelectorAll('button')]
      .find((x) => (x.textContent || '').includes(m) || (x.getAttribute('aria-label') || '').includes(m));
    if (!el) return false;
    el.click();
    return true;
  })()`);
}

async function viewport(w, h) {
  await send('Emulation.setDeviceMetricsOverride', {
    width: w, height: h, deviceScaleFactor: 1, mobile: w < 500,
  });
}

async function photo(nom) {
  await new Promise((r) => setTimeout(r, 700));
  const r = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(OUT, `${nom}.png`), Buffer.from(r.data, 'base64'));
  console.log(`capture ${nom}.png`);
}

const attente = (ms) => new Promise((r) => setTimeout(r, ms));

async function uneLecture() {
  if (!await clic('Enregistrer ma lecture')) throw new Error('bouton Enregistrer ma lecture introuvable');
  await attente(2600);
  if (!await clic('Terminer')) throw new Error('bouton Terminer introuvable');
  await attente(1500);
  if (!await clic('bon, analyser')) throw new Error('bouton analyser introuvable');
  await attente(1800);
}

async function main() {
  const liste = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)).json();
  const page = liste.find((t) => t.type === 'page');
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pendants.has(m.id)) {
      const p = pendants.get(m.id);
      pendants.delete(m.id);
      if (m.error) p.reject(new Error(m.error.message)); else p.resolve(m.result);
    }
  };
  await send('Page.enable');
  await send('Runtime.enable');

  // 1. Accueil 1440
  await viewport(1440, 900);
  await send('Page.navigate', { url: URL });
  await attendrePret();
  await attente(600);
  await evaluer(BOUCHON_MICRO, true);
  await evaluer(BOUCHON_TTS);
  await photo('socle-accueil-1440');
  const a1 = await audit('accueil-1440');

  // 2. Accueil 375
  await viewport(375, 812);
  await attente(500);
  await photo('socle-accueil-375');
  const a2 = await audit('accueil-375');
  const badgeAccueil = await evaluer(
    `Boolean([...document.querySelectorAll('.badge-simulation')]
      .some((b) => /Simulation locale/i.test(b.textContent)))`,
  );
  const souligne = await evaluer(
    `(() => {
      const svg = document.querySelector('h1 svg path');
      if (!svg) return { present: false };
      const st = getComputedStyle(svg);
      return { present: true, stroke: st.stroke, dash: st.strokeDasharray };
    })()`,
  );
  console.log(`badge accueil : ${badgeAccueil ? 'ok' : 'ECHEC'}`);
  console.log(`souligné SVG : ${JSON.stringify(souligne)}`);

  // Audit Miroir : scène, verre, motifs, pointillé, chevauchement panneau/scène.
  const miroir = await evaluer(`(() => {
    const scene = document.querySelector('.scene-miroir');
    const panel = document.querySelector('.panneau-verre');
    const verre = panel ? getComputedStyle(panel) : null;
    let chevauchement = null;
    if (scene && panel) {
      chevauchement = Math.round(scene.getBoundingClientRect().bottom - panel.getBoundingClientRect().top);
    }
    return {
      variante: document.body.className.includes('fond-miroir') || Boolean(scene),
      scene: Boolean(scene),
      pattern: Boolean(document.querySelector('pattern[id^="pt-"]')),
      pointille: Boolean(document.querySelector('.cible-pointille')),
      verre: verre ? verre.backdropFilter : '',
      chevauchementPx: chevauchement,
    };
  })()`);
  console.log(`miroir : ${JSON.stringify(miroir)}`);
  await audit('accueil-miroir');

  // 3. Parcours → Diagnostic
  await viewport(1440, 900);
  await attente(400);
  if (!await clic('Je la lis à voix haute')) throw new Error('bouton Je la lis à voix haute introuvable');
  await attente(1000);
  for (let n = 0; n < 3; n++) {
    await uneLecture();
    console.log(`lecture ${n + 1}/3 ok`);
  }
  // attendre le diagnostic (héros phonème)
  let diagnostic = false;
  for (let i = 0; i < 20; i++) {
    diagnostic = await evaluer('Boolean(document.querySelector(\'[aria-label^="phonème cible"]\'))');
    if (diagnostic) break;
    await attente(500);
  }
  if (!diagnostic) throw new Error('diagnostic jamais atteint');
  await photo('socle-diagnostic-1440');
  const d1 = await audit('diagnostic-1440');
  const diag = await evaluer(`(() => {
    const heros = document.querySelectorAll('[aria-label^="phonème cible"]');
    const chiffre = [...document.querySelectorAll('[aria-label^="score du phonème"]')]
      .map((e) => { const s = getComputedStyle(e); return { fs: s.fontSize, fam: s.fontFamily.slice(0, 20), txt: e.textContent }; });
    const badge = document.querySelector('.badge-simulation')?.textContent ?? '';
    const paire = document.querySelector('[aria-label^="Paire minimale"]');
    const cellules = paire ? [...paire.querySelectorAll('.paire-cell')].map((c) => {
      const r = c.getBoundingClientRect();
      return { h: Math.round(r.height), cible: c.className.includes('paire-cell-cible') };
    }) : [];
    const fourchette = Boolean(document.querySelector('[aria-label^="Score"]'));
    const grilleParams = Boolean(document.querySelector('[aria-label^="Paramètres articulatoires"]'));
    const scene = document.querySelector('.scene-miroir');
    const encart = Boolean(document.querySelector('figure.encart svg[role="img"]'));
    const simulation = (document.body.innerText.match(/simul/gi) || []).length;
    let miroirChevauch = null;
    const panel = document.querySelector('.panneau-verre');
    if (scene && panel) {
      miroirChevauch = Math.round(scene.getBoundingClientRect().bottom - panel.getBoundingClientRect().top);
    }
    return { heros: heros.length, chiffre, badge, cellules, fourchette, encart, simulation, miroir: { scene: Boolean(scene), grilleParams, chevauchementPx: miroirChevauch } };
  })()`);
  console.log(`diagnostic : ${JSON.stringify(diag)}`);

  await viewport(375, 812);
  await attente(500);
  await photo('socle-diagnostic-375');
  const d2 = await audit('diagnostic-375');
  console.log(`résultat : titre ok=${a1.titre.length > 0} overflow-a375=${a2.overflow} overflow-d375=${d2.overflow}`);
  ws.close();
}

main().catch((e) => { console.error('ERREUR:', e.message); process.exit(1); });
