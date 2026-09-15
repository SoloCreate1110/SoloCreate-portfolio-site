import Phaser from 'phaser';
import { formatDate } from '../utils/date';
import { deleteGacha, getGachas } from '../services/storage';
import { setScreen } from '../ui/dom';
import { escapeHtml } from '../utils/html';

export class HomeScene extends Phaser.Scene {
  constructor() {
    super('HomeScene');
  }

  create(): void {
    this.renderBackground();
    this.renderDom();
  }

  private renderBackground(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0xfffbf2);
    this.add.circle(width - 44, 72, 82, 0xffd166, 0.32);
    this.add.circle(28, height - 86, 110, 0xff9f1c, 0.16);
    this.add.text(width / 2, 72, 'まよったらガチャ', {
      fontFamily: 'sans-serif',
      fontSize: '28px',
      color: '#5c3500',
      fontStyle: '700',
    }).setOrigin(0.5);
  }

  private renderDom(): void {
    const gachas = getGachas();

    setScreen(`
      <section class="screen home-screen">
        <a class="portfolio-back" href="../">← アプリ紹介</a>
        <div class="top-actions">
          <button class="icon-button" data-action="settings" aria-label="設定">⚙</button>
        </div>
        <div class="screen-spacer"></div>
        <div class="toolbar">
          <h1>ガチャ一覧</h1>
          <button class="primary-button" data-action="new">新規作成</button>
        </div>
        <div class="gacha-list">
          ${gachas
            .map(
              (gacha) => `
                <article class="gacha-card">
                  <div>
                    <h2>${escapeHtml(gacha.title)}</h2>
                    <p>${gacha.items.length}候補・更新 ${formatDate(gacha.updatedAt)}</p>
                  </div>
                  <div class="card-actions">
                    <button class="primary-button small" data-action="play" data-id="${gacha.id}">引く</button>
                    <button class="ghost-button small" data-action="edit" data-id="${gacha.id}">編集</button>
                    <button class="danger-button small" data-action="delete" data-id="${gacha.id}">削除</button>
                  </div>
                </article>
              `,
            )
            .join('')}
        </div>
      </section>
    `);

    document.querySelectorAll<HTMLButtonElement>('[data-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.action;
        const id = button.dataset.id;

        if (action === 'new') this.scene.start('EditGachaScene');
        if (action === 'settings') this.scene.start('SettingsScene');
        if (action === 'play' && id) this.scene.start('PlayGachaScene', { id });
        if (action === 'edit' && id) this.scene.start('EditGachaScene', { id });
        if (action === 'delete' && id) {
          const target = getGachas().find((gacha) => gacha.id === id);
          if (target && confirm(`「${target.title}」を削除しますか？`)) {
            deleteGacha(id);
            this.scene.restart();
          }
        }
      });
    });
  }
}
