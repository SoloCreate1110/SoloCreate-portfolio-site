import Phaser from 'phaser';
import { loadStorage, resetAllData, updateSettings } from '../services/storage';
import { qs, setScreen } from '../ui/dom';

export class SettingsScene extends Phaser.Scene {
  constructor() {
    super('SettingsScene');
  }

  create(): void {
    this.renderBackground();
    this.renderDom();
  }

  private renderBackground(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0xfffbf2);
    this.add.circle(width - 48, 88, 96, 0xffd166, 0.3);
    this.add.text(width / 2, 72, '設定', {
      fontFamily: 'sans-serif',
      fontSize: '28px',
      color: '#5c3500',
      fontStyle: '700',
    }).setOrigin(0.5);
  }

  private renderDom(): void {
    const { settings } = loadStorage();

    setScreen(`
      <section class="screen settings-screen">
        <div class="screen-spacer"></div>
        <div class="settings-panel">
          <label class="toggle-row">
            <span>効果音</span>
            <input type="checkbox" name="sound" ${settings.soundEnabled ? 'checked' : ''} />
          </label>
          <label class="toggle-row">
            <span>振動</span>
            <input type="checkbox" name="vibration" ${settings.vibrationEnabled ? 'checked' : ''} />
          </label>
          <button class="danger-button" data-action="reset">データ初期化</button>
        </div>
        <button class="ghost-button" data-action="back">一覧へ戻る</button>
      </section>
    `);

    const save = (): void => {
      updateSettings({
        soundEnabled: qs<HTMLInputElement>('input[name="sound"]').checked,
        vibrationEnabled: qs<HTMLInputElement>('input[name="vibration"]').checked,
      });
    };

    qs<HTMLInputElement>('input[name="sound"]').addEventListener('change', save);
    qs<HTMLInputElement>('input[name="vibration"]').addEventListener('change', save);
    qs<HTMLButtonElement>('[data-action="back"]').addEventListener('click', () => this.scene.start('HomeScene'));
    qs<HTMLButtonElement>('[data-action="reset"]').addEventListener('click', () => {
      if (confirm('すべてのガチャと履歴を初期化しますか？')) {
        resetAllData();
        this.scene.start('HomeScene');
      }
    });
  }
}
