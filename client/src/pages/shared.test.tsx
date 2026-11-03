import { describe, expect, it } from 'vitest';
import { formatDate, formatPrice } from './shared';

describe('shared booking display helpers', () => {
  it('formats prices as Vietnamese dong', () => {
    expect(formatPrice(125000)).toContain('125.000');
  });

  it('formats valid booking dates', () => {
    expect(formatDate('2026-11-02T00:00:00.000Z')).not.toBe('Invalid Date');
  });
});
