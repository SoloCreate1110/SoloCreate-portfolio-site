export type DrawPhase = 'closed' | 'closing' | 'drawing' | 'revealed';
type Schedule = (callback: () => void, delay: number) => ReturnType<typeof setTimeout>;

// Presentation owns no result data. A skip or navigation can never draw again.
export class DrawPresentation {
  private timers: ReturnType<typeof setTimeout>[] = [];
  private running = false;
  private complete: (() => void) | undefined;

  constructor(
    private phase: (phase: DrawPhase) => void,
    private schedule: Schedule = (callback, delay) => setTimeout(callback, delay),
    private clear: (timer: ReturnType<typeof setTimeout>) => void = timer => clearTimeout(timer),
  ) {}

  start(reducedMotion: boolean, complete: () => void) {
    this.cancel();
    this.running = true;
    this.complete = complete;
    this.phase('closing');
    if (!reducedMotion) this.timers.push(this.schedule(() => {
      if (this.running) this.phase('drawing');
    }, 220));
    this.timers.push(this.schedule(() => this.finish(), reducedMotion ? 0 : 900));
  }

  finish() {
    if (!this.running) return;
    const complete = this.complete;
    this.stop();
    this.phase('revealed');
    complete?.();
  }

  cancel() {
    this.stop();
    this.phase('closed');
  }

  private stop() {
    this.running = false;
    this.complete = undefined;
    this.timers.forEach(timer => this.clear(timer));
    this.timers = [];
  }
}
