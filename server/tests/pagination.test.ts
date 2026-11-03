import { describe, expect, it } from 'vitest';
import { getPagination } from '../src/utils/pagination';

describe('getPagination', () => {
  it('uses the supplied default page size when values are absent', () => {
    expect(getPagination(undefined, undefined, 12)).toEqual({
      page: 1,
      limit: 12,
      skip: 0,
    });
  });

  it('clamps page sizes and rejects invalid values', () => {
    expect(getPagination('-2', '500', 10, 50)).toEqual({
      page: 1,
      limit: 50,
      skip: 0,
    });
    expect(getPagination('3', '5', 10)).toEqual({
      page: 3,
      limit: 5,
      skip: 10,
    });
  });
});
