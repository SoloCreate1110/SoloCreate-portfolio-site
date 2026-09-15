import Phaser from 'phaser';
import { loadStorage } from '../services/storage';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    loadStorage();
    this.scene.start('HomeScene');
  }
}
