import Phaser from 'phaser';
import type { GachaData } from '../data/types';
import { addHistory, clearHistories, getGacha, loadStorage } from '../services/storage';
import { formatDateTime } from '../utils/date';
import { escapeHtml } from '../utils/html';
import { qs, setScreen } from '../ui/dom';

type PlaySceneData = {
  id: string;
};

export class PlayGachaScene extends Phaser.Scene {
  private gacha?: GachaData;
  private resultText?: Phaser.GameObjects.Text;
  private ring?: Phaser.GameObjects.Arc;
  private isDrawing = false;

  constructor() {
    super('PlayGachaScene');
  }

  init(data: PlaySceneData): void {
    this.isDrawing = false;
    this.gacha = getGacha(data.id);
  }

  create(): void {
    if (!this.gacha) {
      this.scene.start('HomeScene');
      return;
    }

    this.renderStage();
    this.renderDom();
  }

  private renderStage(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0xfffbf2);
    this.add.circle(width / 2, 224, 112, 0xffd166, 0.7);
    this.add.circle(width / 2, 224, 82, 0xffffff, 1);
    this.ring = this.add.arc(width / 2, 224, 102, 0, 360, false, 0xff9f1c, 1).setStrokeStyle(10, 0xff9f1c);
    this.resultText = this.add.text(width / 2, 224, '？', {
      fontFamily: 'sans-serif',
      fontSize: '42px',
      color: '#5c3500',
      fontStyle: '700',
      align: 'center',
      wordWrap: { width: Math.min(280, width - 64) },
    }).setOrigin(0.5);

    this.tweens.add({
      targets: this.ring,
      angle: 360,
      duration: 2600,
      repeat: -1,
      ease: 'Linear',
    });
  }

  private renderDom(): void {
    if (!this.gacha) return;

    setScreen(`
      <section class="screen play-screen">
        <div class="play-topbar">
          <button class="ghost-button small" data-action="back">一覧</button>
          <button class="ghost-button small" data-action="edit">編集</button>
        </div>
        <div class="play-title">
          <h1>${escapeHtml(this.gacha.title)}</h1>
          <p>${this.gacha.items.length}候補</p>
        </div>
        <div class="play-gap"></div>
        <div class="result-panel">
          <p class="result-label">結果</p>
          <strong class="dom-result">まだ引いていません</strong>
        </div>
        <button class="draw-button" data-action="draw">ガチャを引く</button>
        <div class="history-head">
          <h2>履歴</h2>
          <button class="ghost-button small" data-action="clear-history">リセット</button>
        </div>
        <ol class="history-list">
          ${this.renderHistory()}
        </ol>
      </section>
    `);

    qs<HTMLButtonElement>('[data-action="back"]').addEventListener('click', () => this.scene.start('HomeScene'));
    qs<HTMLButtonElement>('[data-action="edit"]').addEventListener('click', () => this.scene.start('EditGachaScene', { id: this.gacha?.id }));
    qs<HTMLButtonElement>('[data-action="draw"]').addEventListener('click', () => this.draw());
    qs<HTMLButtonElement>('[data-action="clear-history"]').addEventListener('click', () => {
      if (!this.gacha) return;
      clearHistories(this.gacha.id);
      this.gacha = getGacha(this.gacha.id);
      qs<HTMLOListElement>('.history-list').innerHTML = this.renderHistory();
    });
  }

  private renderHistory(): string {
    if (!this.gacha || this.gacha.histories.length === 0) {
      return '<li class="empty-history">履歴はまだありません</li>';
    }

    return this.gacha.histories
      .map((history) => `<li><span>${escapeHtml(history.resultName)}</span><time>${formatDateTime(history.createdAt)}</time></li>`)
      .join('');
  }

  private draw(): void {
    if (!this.gacha || this.isDrawing) return;
    this.isDrawing = true;
    qs<HTMLButtonElement>('[data-action="draw"]').disabled = true;

    const items = this.gacha.items;
    let ticks = 0;

    this.soundTick();
    const timer = this.time.addEvent({
      delay: 58,
      repeat: 24,
      callback: () => {
        const item = items[ticks % items.length];
        this.resultText?.setText(item.name);
        ticks += 1;
      },
    });

    this.time.delayedCall(1550, () => {
      timer.remove(false);
      const result = items[Math.floor(Math.random() * items.length)];
      this.resultText?.setText(result.name);
      this.cameras.main.shake(150, 0.008);
      this.flashResult();
      this.finishDraw(result.name);
    });
  }

  private finishDraw(resultName: string): void {
    if (!this.gacha) return;

    const settings = loadStorage().settings;
    if (settings.vibrationEnabled && typeof navigator.vibrate === 'function') {
      navigator.vibrate([40, 30, 70]);
    }

    addHistory(this.gacha.id, resultName);
    this.gacha = getGacha(this.gacha.id);
    qs<HTMLElement>('.dom-result').textContent = resultName;
    qs<HTMLOListElement>('.history-list').innerHTML = this.renderHistory();
    qs<HTMLButtonElement>('[data-action="draw"]').disabled = false;
    this.isDrawing = false;
  }

  private flashResult(): void {
    const { width, height } = this.scale;
    const flash = this.add.circle(width / 2, 224, 18, 0xffffff, 0.95);
    this.tweens.add({
      targets: flash,
      radius: Math.max(width, height),
      alpha: 0,
      duration: 420,
      ease: 'Cubic.easeOut',
      onComplete: () => flash.destroy(),
    });
  }

  private soundTick(): void {
    const settings = loadStorage().settings;
    if (!settings.soundEnabled) return;

    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.frequency.value = 660;
    gain.gain.setValueAtTime(0.04, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.18);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.onended = () => { void audioContext.close(); };
    oscillator.stop(audioContext.currentTime + 0.18);
  }
}
