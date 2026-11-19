import { bannerYear } from './retrospective-window';

describe('bannerYear', () => {
  it('offers the ending year from December 1st', () => {
    expect(bannerYear(new Date(2026, 11, 1), [2026, 2025])).toBe(2026);
    expect(bannerYear(new Date(2026, 11, 31), [2026])).toBe(2026);
  });

  it('offers the year that just ended through January 31st', () => {
    expect(bannerYear(new Date(2027, 0, 1), [2026])).toBe(2026);
    expect(bannerYear(new Date(2027, 0, 31), [2026])).toBe(2026);
  });

  it('offers nothing outside the window', () => {
    expect(bannerYear(new Date(2026, 10, 30), [2026])).toBeNull();
    expect(bannerYear(new Date(2027, 1, 1), [2026])).toBeNull();
  });

  it('offers nothing when the year has no completed entries', () => {
    expect(bannerYear(new Date(2026, 11, 15), [2025])).toBeNull();
    expect(bannerYear(new Date(2027, 0, 10), [])).toBeNull();
  });
});
