import { FormatPipe } from './format.pipe';

describe('FormatPipe', () => {
  const pipe = new FormatPipe();

  it('fills every placeholder', () => {
    expect(pipe.transform('{n} of {total}', { n: 2, total: 8 })).toBe('2 of 8');
  });

  it('keeps a placeholder that has no value', () => {
    expect(pipe.transform('Your {year}', {})).toBe('Your {year}');
  });
});
