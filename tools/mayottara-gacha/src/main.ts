import './styles/app.css';
import { getGachas, getGacha, saveGacha, deleteGacha, drawGacha, setDrawMode, clearHistories, loadStorage, updateSettings, resetAllData, restoreStorage } from './services/storage';
import { escapeHtml as e } from './utils/html';
import { formatDateTime } from './utils/date';
import { DrawPresentation } from './utils/drawPresentation';

const root = document.querySelector<HTMLElement>('#dom-ui')!;
let presentation: DrawPresentation | undefined;
let deleteTarget: string | undefined;
let busy = false;
let drawCooldown = 0;
let finishDraw: (() => void) | undefined;
let preserveView = false;
let quickDraw = false;
let activeHash = '';
let undo: (() => void) | undefined;
const capsule = `<div class="capsule-scene" aria-hidden="true"><i class="spark s1">✦</i><i class="spark s2">✦</i><div class="capsule"><div class="capsule-top"></div><div class="capsule-bottom"><span>✳</span></div></div><div class="capsule-shadow"></div></div>`;
const templates = [{ title: '今日のランチ', items: ['定食', 'カレー', 'パスタ', 'ラーメン'] }, { title: '休日の過ごし方', items: ['映画を観る', '散歩に出かける', 'カフェで読書', '家でのんびり'] }, { title: 'まずは10分', items: ['机を片づける', 'ストレッチ', '本を読む', 'やることを書き出す'] }];
let hasUnsavedChanges = () => false;
const button = (label: string, action: string, cls = 'ghost', attrs = '') => `<button class="${cls}" data-action="${action}" ${attrs}>${label}</button>`;
const header = () => `<header class="app-header"><a class="brand" href="#"><span class="brand-icon" aria-hidden="true">✳</span>まよったらガチャ<span class="brand-dot">.</span></a><div class="header-actions">${button('?', 'help', 'help-button', 'type="button" aria-label="使い方を開く" aria-haspopup="dialog" title="使い方"')}${button('設定', 'settings', 'text-button')}</div></header>`;
const helpDialog = () => `<dialog class="help-dialog" aria-labelledby="help-title">
  <div class="help-dialog-heading"><h2 id="help-title">まよったらガチャの使い方</h2>${button('×', 'close-help', 'help-close', 'type="button" aria-label="使い方を閉じる" autofocus')}</div>
  <p class="help-intro">迷ったときは、候補を入れてひと回し。</p>
  <ol class="help-steps">
    <li><h3>ひと押しで、今日のひとつ</h3><p>マイガチャの「すぐ引く」で抽選。「開く」で候補や前回の結果を確認できます。演出中の「結果をすぐ見る」で待ち時間を省略できます。</p></li>
    <li><h3>自分のガチャをつくる</h3><p>「＋ ガチャをつくる」またはひな形から名前と候補を入力します。候補は1行に1つ、2〜100個。「保存して抽選へ」で抽選画面へ進みます。</p></li>
    <li><h3>抽選方法を選ぶ</h3><p>「毎回ランダム」は毎回すべての候補から同じ確率で抽選。「一巡まで重複なし」は全候補が出るまで同じ候補が出ません。</p></li>
    <li><h3>編集・履歴・バックアップ</h3><p>候補は「編集」から変更でき、「複製して編集」で元のガチャを残して再利用できます。一覧の「削除」または編集画面から、選んだガチャだけを確認して削除できます。削除と履歴消去は直後の「元に戻す」で取り消せます。抽選画面には直近100回の履歴を保存。「設定」では効果音・振動の切り替えやバックアップの保存・読み込みができます。</p></li>
  </ol>
  <p class="help-storage">ガチャと履歴はこのブラウザに保存されます。ブラウザのデータを消去すると消えるため、大切なガチャは設定からバックアップしてください。</p>
  ${button('わかった、使ってみる', 'done-help', 'primary', 'type="button"')}
</dialog>`;
const deleteDialog = () => `<dialog class="delete-dialog" aria-labelledby="delete-title" aria-describedby="delete-description"><span class="eyebrow">DELETE GACHA</span><h2 id="delete-title">このガチャを削除しますか？</h2><p class="delete-target"></p><p id="delete-description">このガチャの候補と抽選履歴を削除します。削除直後の「元に戻す」で取り消せます。</p><div class="form-actions">${button('キャンセル', 'cancel-delete', 'ghost', 'autofocus')}${button('削除する', 'confirm-delete', 'danger')}</div></dialog>`;
function requestDelete(id: string) {
  if (busy) return;
  const g = getGacha(id); if (!g) return;
  deleteTarget = id;
  root.querySelector('.delete-target')!.textContent = g.title;
  root.querySelector<HTMLDialogElement>('.delete-dialog')!.showModal();
}
function mount(content: string) {
  const scroll = window.scrollY;
  finishDraw = undefined;
  undo = undefined;
  presentation?.cancel();
  presentation = undefined;
  deleteTarget = undefined;
  busy = false;
  hasUnsavedChanges = () => false;
  root.innerHTML = `${header()}<div class="page">${content}</div><footer>小さな迷いを、ちょっと楽しく。</footer><p class="toast" role="alert" hidden></p>${helpDialog()}${deleteDialog()}`;
  window.scrollTo(0, preserveView ? scroll : 0);
  root.querySelector('h1')?.setAttribute('tabindex', '-1');
  if (!preserveView) root.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
  preserveView = false;
  document.documentElement.classList.toggle('reduce-motion', Boolean(loadStorage().settings.reducedMotion));
  const help = root.querySelector<HTMLDialogElement>('.help-dialog')!;
  on('help', () => help.showModal());
  on('close-help', () => help.close());
  on('done-help', () => help.close());
  on('settings', settings);
  const deletion = root.querySelector<HTMLDialogElement>('.delete-dialog')!;
  on('cancel-delete', () => { deleteTarget = undefined; deletion.close(); });
  deletion.addEventListener('cancel', () => { deleteTarget = undefined; });
  on('confirm-delete', () => {
    const g = deleteTarget ? getGacha(deleteTarget) : undefined;
    if (!g || busy) return;
    const backup = structuredClone(loadStorage());
    deleteGacha(g.id);
    hasUnsavedChanges = () => false;
    home();
    showNotice(`「${g.title}」を削除しました`, () => { restoreStorage(backup, true); renderHome(); });
  });
}
function on(action: string, callback: (event: MouseEvent) => void) {
  root.querySelector(`[data-action="${action}"]`)?.addEventListener('click', event => { try { callback(event as MouseEvent); } catch (error) { showError(error); } });
}
function showError(error: unknown) {
  const toast = root.querySelector<HTMLElement>('.toast')!;
  toast.classList.remove('notice');
  toast.hidden = false;
  toast.textContent = error instanceof Error ? error.message : '処理できませんでした。もう一度お試しください。';
}
const percent = (n: number) => `${(100 / n).toLocaleString('ja-JP', { maximumFractionDigits: 1 })}%`;
function renderHome() {
  const gachas = getGachas();
  mount(`<section class="hero"><div class="hero-copy"><span class="eyebrow">LET CHANCE CHOOSE</span><h1>迷う時間も、<br><span>楽しんじゃおう。</span></h1><p>ごはんも、遊びも、今日やることも。<br>候補を入れたら、あとは運におまかせ。</p><span class="local-note">● 登録不要 · このブラウザに自動保存</span></div><div class="hero-art">${capsule}<span class="art-note">小さな偶然、ひとつどうぞ。</span></div></section>
    <section><div class="section-heading"><div><span class="eyebrow">MY COLLECTION</span><h2>マイガチャ <span class="count">${gachas.length}</span></h2></div>${button('＋ ガチャをつくる', 'new', 'primary')}</div>
    <div class="collection">${gachas.map((g, i) => `<article class="gacha-card"><div class="card-top"><span class="tile tile-${i % 3}" aria-hidden="true">${['✳', '↗', '✦'][i % 3]}</span><div class="card-tools"><span class="badge">${g.items.length} 候補</span>${button('削除', `delete-${i}`, 'card-delete', `aria-label="${e(g.title)}を削除"`)}</div></div><h3>${e(g.title)}</h3><p class="preview">${g.items.slice(0, 4).map(item => e(item.name)).join(' / ')}${g.items.length > 4 ? ' …' : ''}</p><p class="last-pick">${g.histories[0] ? `前回：<strong>${e(g.histories[0].resultName)}</strong>` : 'まだ引いていないガチャ'}</p><div class="card-bottom">${button('すぐ引く <span aria-hidden="true">↗</span>', `quick-${i}`, 'card-play')}${button('開く', `play-${i}`, 'text-button')}${button('編集', `edit-${i}`, 'text-button')}</div></article>`).join('')}
    <button class="new-card" data-action="new-card"><span aria-hidden="true">＋</span><strong>${gachas.length ? '新しいガチャ' : 'はじめてのガチャをつくる'}</strong><small>あなたの候補で、自由につくろう</small></button></div></section><section class="template-section"><div><span class="eyebrow">START WITH AN IDEA</span><h2>ひな形から、気軽に。</h2><p class="muted">候補を自由に変えて、自分のガチャに。</p></div><div class="template-list">${templates.map((t, i) => button(`${['🍽', '☀', '✳'][i]} ${e(t.title)} <span aria-hidden="true">＋</span>`, `template-${i}`, 'template-button')).join('')}</div></section>`);
  on('new', () => edit()); on('new-card', () => edit());
  gachas.forEach((g, i) => { on(`quick-${i}`, () => { quickDraw = true; play(g.id); }); on(`play-${i}`, () => play(g.id)); on(`edit-${i}`, () => edit(g.id)); on(`delete-${i}`, () => requestDelete(g.id)); });
  templates.forEach((t, i) => on(`template-${i}`, () => { edit(); renderEdit(undefined, t); }));
}
function renderPlay(id: string) {
  const g = getGacha(id); if (!g) return home();
  const latest = g.histories[0];
  const cycle = g.mode === 'cycle';
  const pool = cycle && g.remaining?.length ? g.items.filter(i => g.remaining!.includes(i.id)) : g.items;
  mount(`<div class="back-row">${button('← マイガチャ', 'back', 'text-button')}<div>${button('複製して編集', 'duplicate', 'text-button')}${button('候補を編集', 'edit', 'text-button')}</div></div><section class="play-heading"><span class="eyebrow">A LITTLE SURPRISE</span><h1>${e(g.title)}</h1><p>${g.items.length}つの候補から、今日のひとつを。</p></section>
    <div class="play-layout"><section class="draw-panel"><div class="segmented" role="group" aria-label="抽選方法">${button('毎回ランダム', 'random', !cycle ? 'selected' : '', `aria-pressed="${!cycle}"`)}${button('一巡まで重複なし', 'cycle', cycle ? 'selected' : '', `aria-pressed="${cycle}"`)}</div><p class="mode-note">${cycle ? `${g.remaining?.length === 0 && latest ? '一巡完了！ 次は全候補から。' : `残り${pool.length} / ${g.items.length}候補。`} 一巡するまで同じ候補は出ません。` : '毎回すべての候補が同じ確率。続けて同じ結果も出ます。'}</p>
    <div class="result-stage" data-phase="closed" aria-live="polite" aria-atomic="true">${capsule}<span class="eyebrow result-label">${latest ? 'YOUR LAST PICK' : 'A LITTLE SURPRISE'}</span><h2 class="result-name">${latest ? e(latest.resultName) : '今日は、どれにする？'}</h2><p class="result-caption">${latest ? `前回の結果 · ${e(formatDateTime(latest.createdAt))}` : 'カプセルの中に、今日のひとつ。'}</p></div>${button(`${latest ? 'もう一度引く' : 'ガチャを引く'} <span aria-hidden="true">↗</span>`, 'draw', 'draw-button')}<div class="result-actions">${button('結果をコピー', 'copy', 'text-button', latest ? '' : 'disabled')}<span>Enterでも抽選 · 演出はスキップ可</span></div><p class="draw-error" role="alert"></p>
    </section><aside class="candidate-panel"><div class="section-heading"><h2>候補と確率</h2><span class="badge">${g.items.length} 候補</span></div><ul class="candidate-list">${g.items.map(item => `<li><span>${e(item.name)}</span><strong>${pool.some(p => p.id === item.id) ? percent(pool.length) : '選出済み'}</strong></li>`).join('')}</ul><details class="help"><summary>同じ結果が続くのはなぜ？</summary><p>毎回ランダムでは、前の結果に関係なく抽選します。4候補で、ある5回の結果がすべて同じになる確率は1/256（約0.39%）です。重複を避けたいときは「一巡まで重複なし」を選んでください。</p></details></aside></div>
    <section class="history-section"><div class="section-heading"><div><span class="eyebrow">YOUR RECENT PICKS</span><h2>抽選履歴 <span class="count">${g.histories.length}</span></h2></div>${button('履歴を消去', 'clear', 'text-button', g.histories.length ? '' : 'disabled')}</div><p class="muted">直近100回を保存。出現回数は保存中の履歴を集計しています。</p><div class="stats">${g.items.map(item => `<span>${e(item.name)} <strong>${g.histories.filter(h => h.itemId ? h.itemId === item.id : h.resultName === item.name).length}回</strong></span>`).join('')}</div><ol class="history-list">${g.histories.slice(0, 10).map((h, i) => `<li><span class="history-number">${String(g.histories.length - i).padStart(2, '0')}</span><strong>${e(h.resultName)}</strong><small>${h.mode === 'cycle' ? '重複なし' : 'ランダム'}</small><time>${e(formatDateTime(h.createdAt))}</time></li>`).join('') || '<li class="empty">まだ履歴はありません。最初のひとつを引いてみよう。</li>'}</ol>${g.histories.length > 10 ? button('残りの履歴を見る', 'more', 'ghost') : ''}</section>`);
  on('back', home); on('edit', () => edit(id));
  on('duplicate', () => { edit(); renderEdit(undefined, {title: (g.title.slice(0, 28) + ' コピー'), items: g.items.map(i => i.name)}); });
  on('copy', () => { if (latest) void navigator.clipboard.writeText(`${g.title}：${latest.resultName}`).then(() => showNotice('結果をコピーしました')).catch(() => showError(new Error('コピーできませんでした。結果の文字を選択してコピーしてください。'))); });
  for (const mode of ['random', 'cycle'] as const) on(mode, () => { if (busy || (g.mode ?? 'random') === mode) return; setDrawMode(id, mode); preserveView = true; renderPlay(id); });
  on('clear', () => { if (!busy) { const backup = structuredClone(loadStorage()); clearHistories(id); preserveView = true; renderPlay(id); showNotice('履歴を消去しました', () => { restoreStorage(backup, true); preserveView = true; renderPlay(id); }); } });
  on('more', () => { const list = root.querySelector('.history-list')!; list.insertAdjacentHTML('beforeend', g.histories.slice(10).map((h, i) => `<li><span class="history-number">${g.histories.length - 10 - i}</span><strong>${e(h.resultName)}</strong><small>${h.mode === 'cycle' ? '重複なし' : 'ランダム'}</small><time>${e(formatDateTime(h.createdAt))}</time></li>`).join('')); root.querySelector('[data-action="more"]')?.remove(); });
  on('draw', event => {
    if (event.detail > 1) return;
    if (busy) { finishDraw?.(); return; }
    if (Date.now() < drawCooldown) return;
    drawGacha(id);
    busy = true;
    undo = undefined;
    root.querySelector('.toast')!.setAttribute('hidden', '');
    for (const action of ['random', 'cycle', 'edit', 'duplicate', 'clear', 'copy']) root.querySelector<HTMLButtonElement>(`[data-action="${action}"]`)!.disabled = true;
    const stage = root.querySelector<HTMLElement>('.result-stage')!;
    presentation = new DrawPresentation(phase => { stage.dataset.phase = phase; });
    stage.setAttribute('aria-busy', 'true');
    root.querySelector('.result-name')!.textContent = '何が出るかな？';
    root.querySelector('.result-caption')!.textContent = 'カプセルを開けています…';
    root.querySelector('.result-label')!.textContent = 'CHOOSING';
    root.querySelector('[data-action="draw"]')!.textContent = '結果をすぐ見る';
    sound();
    finishDraw = () => presentation?.finish();
    presentation.start(Boolean(loadStorage().settings.reducedMotion || matchMedia('(prefers-reduced-motion: reduce)').matches), () => {
      drawCooldown = Date.now() + 650;
      preserveView = true;
      renderPlay(id);
      root.querySelector('.result-caption')!.textContent = '今日のひとつ、決まり！';
      root.querySelector('.result-label')!.textContent = 'YOUR PICK';
      root.querySelector<HTMLElement>('.result-stage')!.dataset.phase = 'revealed';
      root.querySelector<HTMLButtonElement>('[data-action="draw"]')!.focus({ preventScroll: true });
      try { if (loadStorage().settings.vibrationEnabled) navigator.vibrate?.(50); } catch { /* optional feedback */ }
    });
  });
  if (quickDraw) { quickDraw = false; root.querySelector<HTMLButtonElement>('[data-action="draw"]')!.click(); }

}
function renderEdit(id?: string, source?: { title: string; items: string[] }) {
  const g = id ? getGacha(id) : undefined;
  mount(`<div class="back-row">${button('← マイガチャ', 'back', 'text-button')}</div><section class="form-heading"><span class="eyebrow">MAKE IT YOURS</span><h1>${g ? 'ガチャを編集' : 'ガチャをつくる'}</h1><p>気になる候補を並べるだけ。あとはガチャにおまかせ。</p></section><form class="edit-form"><label for="title">ガチャの名前</label><input id="title" maxlength="32" required placeholder="例：今日のランチ" value="${e(g?.title ?? source?.title ?? '')}"><div class="field-heading"><label for="candidates">候補</label><span class="muted">2〜100個・各40文字まで</span></div><textarea aria-describedby="candidate-hint form-error" id="candidates" rows="8" required placeholder="1行に1つずつ入力\n焼肉\n寿司\n定食\nラーメン">${e(g?.items.map(i => i.name).join('\n') ?? source?.items.join('\n') ?? '')}</textarea><p id="candidate-hint" class="input-hint muted">1行に1つ。空行は無視します。同じ名前は使えません。</p><p class="candidate-count" aria-live="polite"></p>${g ? '<p class="muted">保存すると「重複なし」の巡回は最初からになります。履歴は残ります。</p>' : ''}<p id="form-error" class="form-error" role="alert"></p><div class="form-actions">${button('キャンセル', 'cancel', 'ghost', 'type="button"')}<button class="primary" type="submit">保存して抽選へ ↗</button></div></form>${g ? `<div class="delete-area">${button('このガチャを削除', 'delete', 'danger')}</div>` : ''}`);
  const input = root.querySelector<HTMLTextAreaElement>('#candidates')!;
  const count = () => { const n = input.value.split('\n').filter(s => s.trim()).length; root.querySelector('.candidate-count')!.textContent = `${n}候補${n ? ` · 毎回ランダムなら各${percent(n)}` : ''}`; };
  input.addEventListener('input', () => { count(); input.removeAttribute('aria-invalid'); root.querySelector('.form-error')!.textContent = ''; }); count();
  hasUnsavedChanges = () => root.querySelector<HTMLInputElement>('#title')!.value !== (g?.title ?? '') || input.value !== (g?.items.map(i => i.name).join('\n') ?? '');
  const leave = home;
  on('back', leave); on('cancel', leave);
  on('delete', () => { if (g) requestDelete(g.id); });
  root.querySelector('form')!.addEventListener('submit', event => { event.preventDefault(); try { const saved = saveGacha({ id, title: root.querySelector<HTMLInputElement>('#title')!.value, itemNames: input.value.split('\n') }); hasUnsavedChanges = () => false; play(saved.id); } catch (error) { root.querySelector('.form-error')!.textContent = (error as Error).message; input.setAttribute('aria-invalid', 'true'); input.focus(); } });
}
function renderSettings() {
  const s = loadStorage().settings;
  mount(`<div class="back-row">${button('← マイガチャ', 'back', 'text-button')}</div><section class="form-heading"><span class="eyebrow">PREFERENCES</span><h1>自分好みに。</h1><p>ガチャの小さな楽しみを、あなたのペースで。</p></section><section class="settings-panel"><label class="toggle-row"><span><strong>動きを減らす</strong><small>演出を省略して、すぐ結果を表示。OSの設定も尊重します。</small></span><input type="checkbox" id="motion" ${s.reducedMotion ? 'checked' : ''}></label><label class="toggle-row"><span><strong>効果音</strong><small>抽選時に短い音を鳴らす</small></span><input type="checkbox" id="sound" ${s.soundEnabled ? 'checked' : ''}></label><label class="toggle-row"><span><strong>振動</strong><small>対応している端末で結果をお知らせ</small></span><input type="checkbox" id="vibration" ${s.vibrationEnabled ? 'checked' : ''}></label><p class="muted">データはこのブラウザに保存されます。ブラウザのデータを消去するとガチャも消えます。</p>${button('バックアップを保存', 'backup', 'ghost')}<p class="muted">バックアップからガチャと履歴を復元できます。</p><label class="restore-label">バックアップを読み込む<input type="file" id="restore" accept="application/json,.json"></label></section><div class="delete-area">${button('すべてのデータを初期化', 'reset', 'danger')}</div>`);
  on('back', home);
  for (const name of ['sound', 'vibration', 'motion']) root.querySelector(`#${name}`)!.addEventListener('change', () => { try { updateSettings({ soundEnabled: root.querySelector<HTMLInputElement>('#sound')!.checked, vibrationEnabled: root.querySelector<HTMLInputElement>('#vibration')!.checked, reducedMotion: root.querySelector<HTMLInputElement>('#motion')!.checked }); document.documentElement.classList.toggle('reduce-motion', Boolean(loadStorage().settings.reducedMotion)); } catch (error) { showError(error); } });
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
function showNotice(message: string, restore?: () => void) {
  const toast = root.querySelector<HTMLElement>('.toast')!;
  toast.classList.add('notice');
  toast.hidden = false;
  toast.innerHTML = `<span>${e(message)}</span>${restore ? button('元に戻す', 'undo', 'ghost') : ''}${button('×', 'dismiss', 'text-button', 'aria-label="通知を閉じる"')}`;
  undo = restore;
  on('undo', () => { const action = undo; undo = undefined; action?.(); });
  on('dismiss', () => { toast.hidden = true; undo = undefined; });
}
function renderRoute() {
  const parts = location.hash.slice(1).split('/');
  activeHash = location.hash;
  if (parts[0] === 'play' && parts[1]) renderPlay(decodeURIComponent(parts[1]));
  else if (parts[0] === 'edit') renderEdit(parts[1] ? decodeURIComponent(parts[1]) : undefined);
  else if (parts[0] === 'settings') renderSettings();
  else renderHome();
}
function navigate(hash: string) {
  if (hasUnsavedChanges() && !confirm('保存せずに移動しますか？')) return;
  hasUnsavedChanges = () => false;
  if (location.hash !== hash) history.pushState(null, '', hash || location.pathname + location.search);
  renderRoute();
}
const home = () => navigate('');
const play = (id: string) => navigate(`#play/${encodeURIComponent(id)}`);
const edit = (id?: string) => navigate(`#edit${id ? '/' + encodeURIComponent(id) : ''}`);
const settings = () => navigate('#settings');
root.addEventListener('click', event => { if ((event.target as Element).closest('.brand')) { event.preventDefault(); try { home(); } catch (error) { showError(error); } } });
window.addEventListener('popstate', () => {
  if (hasUnsavedChanges() && !confirm('保存せずに移動しますか？')) { history.pushState(null, '', activeHash || location.pathname + location.search); return; }
  try { renderRoute(); } catch (error) { showError(error); }
});
root.addEventListener('keydown', event => {
  if (event.repeat && (event.target as Element).closest('[data-action="draw"]')) { event.preventDefault(); return; }
  if (event.key !== 'Enter' || event.repeat || event.isComposing || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  const target = event.target as Element;
  if (target.closest('button, input, textarea, summary, a, dialog')) return;
  const draw = root.querySelector<HTMLButtonElement>('[data-action="draw"]');
  if (draw) { event.preventDefault(); draw.click(); }
});
window.addEventListener('beforeunload', event => { if (hasUnsavedChanges()) { event.preventDefault(); event.returnValue = ''; } });
try { renderRoute(); } catch (error) { root.innerHTML = `<div class="page"><h1>データを読み込めませんでした</h1><p>${e((error as Error).message)}</p><p>ブラウザの保存設定を確認してから再読み込みしてください。元の保存データは保持しています。</p></div>`; }
