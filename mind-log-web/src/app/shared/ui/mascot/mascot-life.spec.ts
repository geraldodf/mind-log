import {MascotLife} from './mascot-life';

const BEAT = 300;

describe('MascotLife', () => {
  let host: HTMLElement;
  let life: MascotLife;

  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate();
    host = document.createElement('div');
    document.body.appendChild(host);
    life = new MascotLife(host, {beat: BEAT, random: () => 0});
  });

  afterEach(() => {
    life.stop();
    host.remove();
    delete (document as {hidden?: boolean}).hidden;
    jasmine.clock().uninstall();
  });

  it('marks the host as alive and still when it starts', () => {
    life.update('wave', true);

    expect(host.classList.contains('m-live')).toBe(true);
    expect(host.dataset['m']).toBe('still');
  });

  it('blinks, and every third blink becomes a gesture', () => {
    life.update('wave', true);

    jasmine.clock().tick(13 * BEAT);
    expect(life.state).toBe('blink');

    jasmine.clock().tick(BEAT);
    expect(life.state).toBe('still');

    jasmine.clock().tick(26 * BEAT);
    expect(life.state).toBe('gesture');
  });

  it('falls asleep on an empty screen after the idle limit and wakes on activity', () => {
    life.update('empty', true);

    jasmine.clock().tick(100 * BEAT);
    expect(life.state).toBe('asleep');

    document.dispatchEvent(new Event('pointerdown'));
    expect(life.state).toBe('wake');

    jasmine.clock().tick(2 * BEAT);
    expect(life.state).toBe('still');
  });

  it('stops without sleeping on other poses after the idle limit', () => {
    life.update('search', true);

    jasmine.clock().tick(100 * BEAT);
    expect(life.state).toBe('still');

    jasmine.clock().tick(60 * BEAT);
    expect(life.state).toBe('still');
  });

  it('keeps moving while there is activity', () => {
    life.update('empty', true);

    jasmine.clock().tick(90 * BEAT);
    document.dispatchEvent(new Event('keydown'));
    jasmine.clock().tick(20 * BEAT);

    expect(life.state).not.toBe('asleep');
  });

  it('startles when the pose becomes an error', () => {
    life.update('empty', true);
    life.update('error', true);

    jasmine.clock().tick(BEAT);
    expect(life.state).toBe('startle');

    jasmine.clock().tick(2 * BEAT);
    expect(life.state).toBe('still');
  });

  it('reacts to a poke and cheers after five in a row', () => {
    life.update('wave', true);

    host.click();
    expect(life.state).toBe('poke');

    for (let i = 0; i < 4; i++) host.click();
    expect(life.state).toBe('cheer');
  });

  it('pauses while the page is hidden', () => {
    life.update('empty', true);
    Object.defineProperty(document, 'hidden', {configurable: true, value: true});
    document.dispatchEvent(new Event('visibilitychange'));

    jasmine.clock().tick(200 * BEAT);
    expect(life.state).toBe('still');

    Object.defineProperty(document, 'hidden', {configurable: true, value: false});
    document.dispatchEvent(new Event('visibilitychange'));
    jasmine.clock().tick(100 * BEAT);
    expect(life.state).toBe('asleep');
  });

  it('turns off and cleans the host when it is not alive', () => {
    life.update('wave', true);
    life.update('wave', false);

    expect(host.classList.contains('m-live')).toBe(false);
    expect(host.dataset['m']).toBeUndefined();
  });
});
