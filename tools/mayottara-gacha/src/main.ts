import Phaser from 'phaser';
import './styles/app.css';
import { BootScene } from './scenes/BootScene';
import { EditGachaScene } from './scenes/EditGachaScene';
import { HomeScene } from './scenes/HomeScene';
import { PlayGachaScene } from './scenes/PlayGachaScene';
import { SettingsScene } from './scenes/SettingsScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#fffbf2',
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  scene: [BootScene, HomeScene, EditGachaScene, PlayGachaScene, SettingsScene],
};

new Phaser.Game(config);
