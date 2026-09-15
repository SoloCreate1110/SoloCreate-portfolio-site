import Phaser from 'phaser';
import { getGacha, saveGacha } from '../services/storage';
import { qsa, qs, setScreen } from '../ui/dom';
import { escapeHtml } from '../utils/html';

type EditSceneData = {
  id?: string;
};

export class EditGachaScene extends Phaser.Scene {
  private gachaId?: string;

  constructor() {
    super('EditGachaScene');
  }

  init(data: EditSceneData): void {
    this.gachaId = data.id;
  }

  create(): void {
    this.renderBackground();
    this.renderDom();
  }

  private renderBackground(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0xfffbf2);
    this.add.circle(width - 36, 86, 74, 0xffd166, 0.34);
    this.add.text(width / 2, 72, this.gachaId ? 'ガチャ編集' : 'ガチャ作成', {
      fontFamily: 'sans-serif',
      fontSize: '28px',
      color: '#5c3500',
      fontStyle: '700',
    }).setOrigin(0.5);
  }

  private renderDom(): void {
    const gacha = this.gachaId ? getGacha(this.gachaId) : undefined;
    const names = gacha?.items.map((item) => item.name) ?? ['', ''];

    setScreen(`
      <section class="screen edit-screen">
        <div class="screen-spacer"></div>
        <form class="edit-form">
          <label>
            <span>ガチャ名</span>
            <input name="title" value="${escapeHtml(gacha?.title ?? '')}" maxlength="32" placeholder="例：今日のランチ" />
          </label>
          <div class="field-head">
            <span>候補リスト</span>
            <button class="ghost-button small" type="button" data-action="add">追加</button>
          </div>
          <div class="item-list">
            ${names.map((name, index) => this.itemRow(name, index)).join('')}
          </div>
          <p class="form-error" role="alert"></p>
          <div class="form-actions">
            <button class="ghost-button" type="button" data-action="cancel">キャンセル</button>
            <button class="primary-button" type="submit">保存</button>
          </div>
        </form>
      </section>
    `);

    qs<HTMLButtonElement>('[data-action="add"]').addEventListener('click', () => {
      qs<HTMLDivElement>('.item-list').insertAdjacentHTML('beforeend', this.itemRow('', qsa<HTMLInputElement>('.item-input').length));
      this.bindRowButtons();
    });

    qs<HTMLButtonElement>('[data-action="cancel"]').addEventListener('click', () => this.scene.start('HomeScene'));
    qs<HTMLFormElement>('.edit-form').addEventListener('submit', (event) => this.handleSubmit(event));
    this.bindRowButtons();
  }

  private itemRow(name: string, index: number): string {
    return `
      <div class="item-row">
        <input class="item-input" value="${escapeHtml(name)}" maxlength="40" placeholder="候補 ${index + 1}" />
        <button class="square-button" type="button" data-action="up" aria-label="上へ">↑</button>
        <button class="square-button" type="button" data-action="down" aria-label="下へ">↓</button>
        <button class="square-button danger" type="button" data-action="remove" aria-label="削除">×</button>
      </div>
    `;
  }

  private bindRowButtons(): void {
    qsa<HTMLButtonElement>('.item-row [data-action]').forEach((button) => {
      button.onclick = () => {
        const row = button.closest<HTMLDivElement>('.item-row');
        if (!row) return;

        if (button.dataset.action === 'remove') row.remove();
        if (button.dataset.action === 'up' && row.previousElementSibling) {
          row.parentElement?.insertBefore(row, row.previousElementSibling);
        }
        if (button.dataset.action === 'down' && row.nextElementSibling) {
          row.parentElement?.insertBefore(row.nextElementSibling, row);
        }
      };
    });
  }

  private handleSubmit(event: SubmitEvent): void {
    event.preventDefault();
    const title = qs<HTMLInputElement>('input[name="title"]').value.trim();
    const itemNames = qsa<HTMLInputElement>('.item-input').map((input) => input.value.trim()).filter(Boolean);
    const error = qs<HTMLParagraphElement>('.form-error');

    if (!title) {
      error.textContent = 'ガチャ名を入力してください。';
      return;
    }

    if (itemNames.length < 2) {
      error.textContent = '候補を2つ以上入力してください。';
      return;
    }

    const saved = saveGacha({ id: this.gachaId, title, itemNames });
    this.scene.start('PlayGachaScene', { id: saved.id });
  }
}
