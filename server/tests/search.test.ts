import { describe, expect, it } from 'vitest';
import { normalizeSearchText } from '../src/utils/search';

describe('normalizeSearchText', () => {
  it('normalizes Vietnamese combining marks to the same form as stored city names', () => {
    expect(normalizeSearchText('Đà Nẵng')).toBe('Đà Nẵng');
  });

  it('trims whitespace around search text', () => {
    expect(normalizeSearchText('  Đà Nẵng  ')).toBe('Đà Nẵng');
  });
});
