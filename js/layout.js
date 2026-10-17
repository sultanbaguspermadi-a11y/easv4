// Layout preferences (device-only, like the theme): they only set data-attributes on <html>; css/style.css does the rest.
// Nothing here touches game state, scoring, board coordinates or the timer.
//   data-layout="classic|duel"   classic = original arrangement; duel = player panels flank the board, buttons underneath
//   data-swap="true"             duel only: player 1 on the right instead of the left
//   data-pdock="top|middle|bottom"  duel only: vertical position of the player panels beside the board
//   data-hist="drawer|docked"    drawer = word log hidden until asked for (default); docked = always in the layout (old behaviour)
import { $ } from './state.js';
import { applyHistMode } from './histview.js';

const KEY = 'scrabble.layout';
const DEF = { layout: 'classic', p1: 'left', pdock: 'bottom', hist: 'drawer' };
const ROWS = [
  ['layout', 'التخطيط', [['classic', 'كلاسيكي'], ['duel', 'مواجهة']]],
  ['p1', 'موضع اللاعب الأول', [['left', 'يسار'], ['right', 'يمين']]],
  ['pdock', 'ارتفاع لوحات اللاعبين', [['top', 'أعلى'], ['middle', 'وسط'], ['bottom', 'أسفل']]],
  ['hist', 'سجل الكلمات', [['drawer', 'عند الطلب'], ['docked', 'مثبّت']]]
];
const ok = (k, v) => ROWS.find(r => r[0] === k)[2].some(o => o[0] === v);

let pref = { ...DEF };

function apply() {
  const d = document.documentElement.dataset;
  if (pref.layout === 'duel') d.layout = 'duel'; else delete d.layout;
  if (pref.layout === 'duel' && pref.p1 === 'right') d.swap = 'true'; else delete d.swap;
  d.pdock = pref.pdock;
  d.hist = pref.hist;
  applyHistMode(pref.hist);
}

function build() {
  $('#lyB').innerHTML = ROWS.map(([k, label, opts]) =>
    `<div class="segRow"><div class="setRowHead">${label}</div><div class="seg" role="group" aria-label="${label}">`
    + opts.map(([v, t]) => `<button type="button" class="btn" data-k="${k}" data-v="${v}" aria-pressed="${pref[k] === v}"${(k === 'p1' || k === 'pdock') && pref.layout !== 'duel' ? ' disabled' : ''}>${t}</button>`).join('')
    + '</div></div>').join('');
}

export function initLayout() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && typeof s === 'object') for (const k of Object.keys(DEF)) if (ok(k, s[k])) pref[k] = s[k];
  } catch { /* missing, corrupted or unavailable: defaults */ }
  apply(); build();
  $('#lyB').addEventListener('click', e => {
    const b = e.target.closest('button[data-k]'); if (!b || b.disabled) return;
    pref[b.dataset.k] = b.dataset.v;
    try { localStorage.setItem(KEY, JSON.stringify(pref)); } catch { /* storage unavailable */ }
    apply(); build();
  });
}
