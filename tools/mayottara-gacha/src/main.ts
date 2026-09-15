import './styles/app.css';
import { getGachas, getGacha, saveGacha, deleteGacha, drawGacha, setDrawMode, clearHistories, loadStorage, updateSettings, resetAllData, restoreStorage } from './services/storage';
import { escapeHtml as e } from './utils/html';
import { formatDateTime } from './utils/date';

const root = document.querySelector<HTMLElement>('#dom-ui')!;
let timer: ReturnType<typeof setTimeout> | undefined;
let busy = false;
let hasUnsavedChanges = () => false;
const button = (label: string, action: string, cls = 'ghost', attrs = '') => `<button class="${cls}" data-action="${action}" ${attrs}>${label}</button>`;
const header = () => `<header class="app-header"><a class="brand" href="#"><span class="brand-icon" aria-hidden="true">✳</span>まよったらガチャ<span class="brand-dot">.</span></a>${button('設定', 'settings', 'text-button')}</header>`;
function mount(content: string) {
  if (timer) clearTimeout(timer);
  busy = false;
  hasUnsavedChanges = () => false;
  root.innerHTML = `${header()}<div class="page">${content}</div><footer>小さな迷いを、ちょっと楽しく。</footer><p class="toast" role="alert" hidden></p>`;
  window.scrollTo(0, 0);
  root.querySelector('h1')?.setAttribute('tabindex', '-1');
  root.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
  on('settings', () => { if (!hasUnsavedChanges() || confirm('保存せずに設定へ移動しますか？')) settings(); });
}
function on(action: string, callback: () => void) {
  root.querySelector(`[data-action="${action}"]`)?.addEventListener('click', () => { try { callback(); } catch (error) { showError(error); } });
}
function showError(error: unknown) {
  const toast = root.querySelector<HTMLElement>('.toast')!;
  toast.hidden = false;
  toast.textContent = error instanceof Error ? error.message : '処理できませんでした。もう一度お試しください。';
}
const percent = (n: number) => `${(100 / n).toLocaleString('ja-JP', { maximumFractionDigits: 1 })}%`;
function home() {
  const gachas = getGachas();
  mount(`<section class="hero"><span class="eyebrow">LET CHANCE CHOOSE</span><h1>迷う時間も、<br><span>楽しんじゃおう。</span></h1><p>ごはんも、遊びも、今日やることも。<br>候補を入れたら、あとは運におまかせ。</p></section>
    <section><div class="section-heading"><div><span class="eyebrow">MY COLLECTION</span><h2>マイガチャ <span class="count">${gachas.length}</span></h2></div>${button('＋ ガチャをつくる', 'new', 'primary')}</div>
    <div class="collection">${gachas.map((g, i) => `<article class="gacha-card"><div class="card-top"><span class="tile tile-${i % 3}" aria-hidden="true">${['✳', '↗', '✦'][i % 3]}</span><span class="badge">${g.items.length} 候補</span></div><h3>${e(g.title)}</h3><p class="preview">${g.items.slice(0, 4).map(item => e(item.name)).join(' / ')}${g.items.length > 4 ? ' …' : ''}</p><div class="card-bottom">${button('ガチャを引く <span aria-hidden="true">↗</span>', `play-${i}`, 'card-play')}${button('編集', `edit-${i}`, 'text-button')}</div></article>`).join('')}
    <button class="new-card" data-action="new-card"><span aria-hidden="true">＋</span><strong>${gachas.length ? '新しいガチャ' : 'はじめてのガチャをつくる'}</strong><small>あなたの候補で、自由につくろう</small></button></div></section>`);
  on('new', () => edit()); on('new-card', () => edit());
  gachas.forEach((g, i) => { on(`play-${i}`, () => play(g.id)); on(`edit-${i}`, () => edit(g.id)); });
}
function play(id: string) {
  const g = getGacha(id); if (!g) return home();
  const cycle = g.mode === 'cycle';
  const pool = cycle && g.remaining?.length ? g.items.filter(i => g.remaining!.includes(i.id)) : g.items;
  mount(`<div class="back-row">${button('← マイガチャ', 'back', 'text-button')}${button('候補を編集', 'edit', 'text-button')}</div><section class="play-heading"><span class="eyebrow">A LITTLE SURPRISE</span><h1>${e(g.title)}</h1><p>${g.items.length}つの候補から、今日のひとつを。</p></section>
    <div class="play-layout"><section class="draw-panel"><div class="segmented" role="group" aria-label="抽選方法">${button('毎回ランダム', 'random', !cycle ? 'selected' : '', `aria-pressed="${!cycle}"`)}${button('一巡まで重複なし', 'cycle', cycle ? 'selected' : '', `aria-pressed="${cycle}"`)}</div><p class="mode-note">${cycle ? `残り${pool.length}候補から同じ確率で抽選。一巡したら全候補に戻ります。` : '毎回すべての候補が同じ確率。続けて同じ結果も出ます。'}</p>
    <div class="result-stage" aria-live="polite" aria-atomic="true"><div class="orb" aria-hidden="true"><span>✳</span></div><span class="eyebrow result-label">READY WHEN YOU ARE</span><h2 class="result-name">今日は、どれにする？</h2><p class="result-caption">ボタンを押して運だめし</p></div>${button('ガチャを引く <span aria-hidden="true">↗</span>', 'draw', 'draw-button')}<p class="draw-error" role="alert"></p>
    </section><aside class="candidate-panel"><div class="section-heading"><h2>候補と確率</h2><span class="badge">${g.items.length} 候補</span></div><ul class="candidate-list">${g.items.map(item => `<li><span>${e(item.name)}</span><strong>${pool.some(p => p.id === item.id) ? percent(pool.length) : '選出済み'}</strong></li>`).join('')}</ul><details class="help"><summary>同じ結果が続くのはなぜ？</summary><p>毎回ランダムでは、前の結果に関係なく抽選します。4候補で、ある5回の結果がすべて同じになる確率は1/256（約0.39%）です。重複を避けたいときは「一巡まで重複なし」を選んでください。</p></details></aside></div>
    <section class="history-section"><div class="section-heading"><div><span class="eyebrow">YOUR RECENT PICKS</span><h2>抽選履歴 <span class="count">${g.histories.length}</span></h2></div>${button('履歴を消去', 'clear', 'text-button', g.histories.length ? '' : 'disabled')}</div><p class="muted">直近100回を保存。出現回数は保存中の履歴を集計しています。</p><div class="stats">${g.items.map(item => `<span>${e(item.name)} <strong>${g.histories.filter(h => h.itemId ? h.itemId === item.id : h.resultName === item.name).length}回</strong></span>`).join('')}</div><ol class="history-list">${g.histories.slice(0, 10).map((h, i) => `<li><span class="history-number">${String(g.histories.length - i).padStart(2, '0')}</span><strong>${e(h.resultName)}</strong><small>${h.mode === 'cycle' ? '重複なし' : 'ランダム'}</small><time>${e(formatDateTime(h.createdAt))}</time></li>`).join('') || '<li class="empty">まだ履歴はありません。最初のひとつを引いてみよう。</li>'}</ol>${g.histories.length > 10 ? button('残りの履歴を見る', 'more', 'ghost') : ''}</section>`);
  on('back', home); on('edit', () => edit(id));
  for (const mode of ['random', 'cycle'] as const) on(mode, () => { if (busy || (g.mode ?? 'random') === mode) return; setDrawMode(id, mode); play(id); });
  on('clear', () => { if (!busy && confirm('このガチャの抽選履歴を消去しますか？')) { clearHistories(id); play(id); } });
  on('more', () => { const list = root.querySelector('.history-list')!; list.insertAdjacentHTML('beforeend', g.histories.slice(10).map((h, i) => `<li><span class="history-number">${g.histories.length - 10 - i}</span><strong>${e(h.resultName)}</strong><small>${h.mode === 'cycle' ? '重複なし' : 'ランダム'}</small><time>${e(formatDateTime(h.createdAt))}</time></li>`).join('')); root.querySelector('[data-action="more"]')?.remove(); });
  on('draw', () => {
    if (busy) return;
    // Commit exactly once before animation. Navigating away never loses a draw.
    const result = drawGacha(id);
    busy = true;
    root.querySelectorAll<HTMLButtonElement>('button').forEach(b => b.disabled = true);
    const stage = root.querySelector('.result-stage')!;
    stage.classList.add('drawing');
    root.querySelector('.result-name')!.textContent = '運におまかせ…';
    root.querySelector('.result-caption')!.textContent = 'ひとつ、選んでいます';
    root.querySelector('.result-label')!.textContent = 'CHOOSING';
    sound();
    timer = setTimeout(() => {
      play(id);
      root.querySelector('.result-name')!.textContent = result.resultName;
      root.querySelector('.result-caption')!.textContent = '今日のひとつ、決まり！';
      root.querySelector('.result-label')!.textContent = 'YOUR PICK';
      root.querySelector('.result-stage')!.classList.add('revealed');
      root.querySelector('[data-action="draw"]')!.innerHTML = 'もう一度引く <span aria-hidden="true">↗</span>';
      root.querySelector<HTMLButtonElement>('[data-action="draw"]')!.focus({ preventScroll: true });
      try { if (loadStorage().settings.vibrationEnabled) navigator.vibrate?.(50); } catch { /* optional feedback */ }
    }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 700);
  });
}
function edit(id?: string) {
  const g = id ? getGacha(id) : undefined;
  mount(`<div class="back-row">${button('← マイガチャ', 'back', 'text-button')}</div><section class="form-heading"><span class="eyebrow">MAKE IT YOURS</span><h1>${g ? 'ガチャを編集' : 'ガチャをつくる'}</h1><p>気になる候補を並べるだけ。あとはガチャにおまかせ。</p></section><form class="edit-form"><label for="title">ガチャの名前</label><input id="title" maxlength="32" required placeholder="例：今日のランチ" value="${e(g?.title ?? '')}"><div class="field-heading"><label for="candidates">候補</label><span class="muted">2〜100個・各40文字まで</span></div><textarea id="candidates" rows="8" required placeholder="1行に1つずつ入力\n焼肉\n寿司\n定食\nラーメン">${e(g?.items.map(i => i.name).join('\n') ?? '')}</textarea><p class="input-hint muted">1行に1つ。空行は無視します。同じ名前は使えません。</p><p class="candidate-count" aria-live="polite"></p>${g ? '<p class="muted">保存すると「重複なし」の巡回は最初からになります。履歴は残ります。</p>' : ''}<p class="form-error" role="alert"></p><div class="form-actions">${button('キャンセル', 'cancel', 'ghost', 'type="button"')}<button class="primary" type="submit">保存して引く ↗</button></div></form>${g ? `<div class="delete-area">${button('このガチャを削除', 'delete', 'danger')}</div>` : ''}`);
  const input = root.querySelector<HTMLTextAreaElement>('#candidates')!;
  const count = () => { const n = input.value.split('\n').filter(s => s.trim()).length; root.querySelector('.candidate-count')!.textContent = `${n}候補${n ? ` · 毎回ランダムなら各${percent(n)}` : ''}`; };
  input.addEventListener('input', count); count();
  hasUnsavedChanges = () => root.querySelector<HTMLInputElement>('#title')!.value !== (g?.title ?? '') || input.value !== (g?.items.map(i => i.name).join('\n') ?? '');
  const leave = () => { if (!hasUnsavedChanges() || confirm('保存せずに戻りますか？')) home(); };
  on('back', leave); on('cancel', leave);
  on('delete', () => { if (g && confirm(`「${g.title}」と履歴を削除しますか？`)) { deleteGacha(g.id); home(); } });
  root.querySelector('form')!.addEventListener('submit', event => { event.preventDefault(); try { const saved = saveGacha({ id, title: root.querySelector<HTMLInputElement>('#title')!.value, itemNames: input.value.split('\n') }); play(saved.id); } catch (error) { root.querySelector('.form-error')!.textContent = (error as Error).message; } });
}
function settings() {
  const s = loadStorage().settings;
  mount(`<div class="back-row">${button('← マイガチャ', 'back', 'text-button')}</div><section class="form-heading"><span class="eyebrow">PREFERENCES</span><h1>自分好みに。</h1><p>ガチャの小さな楽しみを、あなたのペースで。</p></section><section class="settings-panel"><label class="toggle-row"><span><strong>効果音</strong><small>抽選時に短い音を鳴らす</small></span><input type="checkbox" id="sound" ${s.soundEnabled ? 'checked' : ''}></label><label class="toggle-row"><span><strong>振動</strong><small>対応している端末で結果をお知らせ</small></span><input type="checkbox" id="vibration" ${s.vibrationEnabled ? 'checked' : ''}></label><p class="muted">データはこのブラウザに保存されます。ブラウザのデータを消去するとガチャも消えます。</p>${button('バックアップを保存', 'backup', 'ghost')}<p class="muted">バックアップからガチャと履歴を復元できます。</p><label class="restore-label">バックアップを読み込む<input type="file" id="restore" accept="application/json,.json"></label></section><div class="delete-area">${button('すべてのデータを初期化', 'reset', 'danger')}</div>`);
  on('back', home);
  for (const name of ['sound', 'vibration']) root.querySelector(`#${name}`)!.addEventListener('change', () => { try { updateSettings({ soundEnabled: root.querySelector<HTMLInputElement>('#sound')!.checked, vibrationEnabled: root.querySelector<HTMLInputElement>('#vibration')!.checked }); } catch (error) { showError(error); } });
  on('backup', () => { const url = URL.createObjectURL(new Blob([JSON.stringify(loadStorage(), null, 2)], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = `mayottara-gacha-${new Date().toISOString().slice(0, 10)}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); });
  root.querySelector<HTMLInputElement>('#restore')!.addEventListener('change', async event => { const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return; try { if (file.size > 5_000_000) throw new Error('ファイルは5MB以下にしてください。'); const value: unknown = JSON.parse(await file.text()); restoreStorage(value, false); if (confirm('現在のガチャと履歴をバックアップの内容に置き換えますか？')) { restoreStorage(value, true); home(); } } catch (error) { showError(error); } finally { (event.target as HTMLInputElement).value = ''; } });
  on('reset', () => { if (confirm('すべてのガチャと履歴を消して、最初の状態に戻しますか？')) { resetAllData(); home(); } });
}
function sound() {
  if (!loadStorage().settings.soundEnabled) return;
  try {
    const ctx = new AudioContext(); const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.frequency.setValueAtTime(520, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + .12);
    gain.gain.setValueAtTime(.025, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + .16);
    osc.connect(gain).connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + .17); osc.onended = () => { void ctx.close().catch(() => {}); };
  } catch { /* Audio is optional and cannot block drawing. */ }
}
root.addEventListener('click', event => { if ((event.target as Element).closest('.brand')) { event.preventDefault(); if (!busy && (!hasUnsavedChanges() || confirm('保存せずに戻りますか？'))) { try { home(); } catch (error) { showError(error); } } } });
window.addEventListener('beforeunload', event => { if (hasUnsavedChanges()) { event.preventDefault(); event.returnValue = ''; } });
try { home(); } catch (error) { root.innerHTML = `<div class="page"><h1>データを読み込めませんでした</h1><p>${e((error as Error).message)}</p><p>ブラウザの保存設定を確認してから再読み込みしてください。</p></div>`; }
