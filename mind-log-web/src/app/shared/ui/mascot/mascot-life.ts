export type MascotAct = 'still' | 'blink' | 'gesture' | 'startle' | 'wake' | 'poke' | 'cheer' | 'asleep';

export interface MascotLifeOptions {
  beat: number;
  random?: () => number;
}

type TimedAct = Exclude<MascotAct, 'still' | 'asleep'>;
type Timer = ReturnType<typeof setTimeout> | undefined;

const FALLBACK_BEAT = 300;
const ACT_BEATS: Record<TimedAct, number> = { blink: 1, gesture: 4, startle: 2, wake: 2, poke: 2, cheer: 6 };
const BLINK_MIN_BEATS = 13;
const BLINK_SPREAD_BEATS = 17;
const BLINKS_PER_GESTURE = 3;
const IDLE_LIMIT_BEATS = 100;
const STARTLE_DELAY_BEATS = 1;
const POKE_WINDOW_BEATS = 4;
const POKES_TO_CHEER = 5;
const SLEEPY_POSES = new Set(['empty', 'rest']);
const ACTIVITY_EVENTS = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart', 'scroll'];

export class MascotLife {
  private pose = '';
  private running = false;
  private inView = true;
  private pageVisible = true;
  private resting = false;
  private act: MascotAct = 'still';
  private lastActivity = 0;
  private blinks = 0;
  private pokes = 0;
  private lastPoke = 0;
  private actTimer: Timer;
  private blinkTimer: Timer;
  private idleTimer: Timer;
  private observer?: IntersectionObserver;
  private readonly beat: number;
  private readonly random: () => number;

  constructor(
    private readonly host: HTMLElement,
    options: MascotLifeOptions,
  ) {
    this.beat = options.beat > 0 ? options.beat : FALLBACK_BEAT;
    this.random = options.random ?? Math.random;
  }

  get state(): MascotAct {
    return this.act;
  }

  update(pose: string, alive: boolean): void {
    if (!alive) return this.stop();
    if (!this.running) return this.start(pose);
    if (pose === this.pose) return;

    this.pose = pose;
    this.lastActivity = Date.now();
    this.resume();
    this.reactToPose();
  }

  stop(): void {
    if (!this.running) return;

    this.running = false;
    this.clearTimers();
    this.observer?.disconnect();
    this.observer = undefined;
    ACTIVITY_EVENTS.forEach((name) => document.removeEventListener(name, this.onActivity, true));
    document.removeEventListener('visibilitychange', this.onPageVisibility);
    this.host.removeEventListener('click', this.onPoke);
    this.host.classList.remove('m-live');
    delete this.host.dataset['m'];
    this.act = 'still';
  }

  private start(pose: string): void {
    this.running = true;
    this.pose = pose;
    this.resting = false;
    this.lastActivity = Date.now();
    this.pageVisible = !document.hidden;
    this.host.classList.add('m-live');
    this.play('still');
    ACTIVITY_EVENTS.forEach((name) => document.addEventListener(name, this.onActivity, { capture: true, passive: true }));
    document.addEventListener('visibilitychange', this.onPageVisibility);
    this.host.addEventListener('click', this.onPoke);
    this.observe();
    if (this.visible()) this.schedule();
    this.reactToPose();
  }

  private readonly onActivity = (): void => {
    this.lastActivity = Date.now();
    if (this.resting && this.visible()) this.resume();
  };

  private readonly onPageVisibility = (): void => {
    this.pageVisible = !document.hidden;
    this.visibilityChanged();
  };

  private readonly onPoke = (): void => {
    const now = Date.now();
    this.pokes = now - this.lastPoke <= POKE_WINDOW_BEATS * this.beat ? this.pokes + 1 : 1;
    this.lastPoke = now;
    if (this.pokes < POKES_TO_CHEER) return this.play('poke');

    this.pokes = 0;
    this.play('cheer');
  };

  private observe(): void {
    if (typeof IntersectionObserver === 'undefined') return;

    this.observer = new IntersectionObserver((entries) => {
      this.inView = entries.some((entry) => entry.isIntersecting);
      this.visibilityChanged();
    });
    this.observer.observe(this.host);
  }

  private visibilityChanged(): void {
    if (!this.running) return;
    if (!this.visible()) return this.pause();

    this.lastActivity = Date.now();
    this.resume();
  }

  private visible(): boolean {
    return this.inView && this.pageVisible;
  }

  private pause(): void {
    this.clearTimers();
    this.resting = false;
    this.play('still');
  }

  private resume(): void {
    const wasAsleep = this.act === 'asleep';
    this.resting = false;
    this.clearTimers();
    this.play(wasAsleep ? 'wake' : 'still');
    this.schedule();
  }

  private reactToPose(): void {
    if (this.pose !== 'error' || !this.visible()) return;

    this.actTimer = setTimeout(() => this.play('startle'), STARTLE_DELAY_BEATS * this.beat);
  }

  private schedule(): void {
    this.scheduleBlink();
    this.scheduleIdleCheck(IDLE_LIMIT_BEATS * this.beat);
  }

  private scheduleBlink(): void {
    clearTimeout(this.blinkTimer);
    const wait = (BLINK_MIN_BEATS + this.random() * BLINK_SPREAD_BEATS) * this.beat;
    this.blinkTimer = setTimeout(() => {
      if (this.act === 'still') this.blink();
      this.scheduleBlink();
    }, wait);
  }

  private blink(): void {
    this.blinks += 1;
    this.play(this.blinks % BLINKS_PER_GESTURE === 0 ? 'gesture' : 'blink');
  }

  private scheduleIdleCheck(wait: number): void {
    clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      const left = IDLE_LIMIT_BEATS * this.beat - (Date.now() - this.lastActivity);
      if (left > 0) return this.scheduleIdleCheck(left);

      this.rest();
    }, wait);
  }

  private rest(): void {
    this.resting = true;
    this.clearTimers();
    this.play(SLEEPY_POSES.has(this.pose) ? 'asleep' : 'still');
  }

  private play(act: MascotAct): void {
    clearTimeout(this.actTimer);
    if (act === this.act && act !== 'still') {
      this.host.dataset['m'] = 'still';
      void this.host.offsetWidth;
    }
    this.act = act;
    this.host.dataset['m'] = act;
    if (act === 'still' || act === 'asleep') return;

    this.actTimer = setTimeout(() => this.play('still'), ACT_BEATS[act] * this.beat);
  }

  private clearTimers(): void {
    clearTimeout(this.actTimer);
    clearTimeout(this.blinkTimer);
    clearTimeout(this.idleTimer);
  }
}
