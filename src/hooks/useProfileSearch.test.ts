import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useProfileSearch } from './useProfileSearch';

describe('useProfileSearch', () => {
  it('filters profiles by query', () => {
    const { result: r1 } = renderHook(() =>
      useProfileSearch('instagram', '')
    );
    expect(r1.current.filtered.length).toBeGreaterThan(0);

    const { result: r2 } = renderHook(() =>
      useProfileSearch('instagram', 'cristiano')
    );
    expect(r2.current.filtered.length).toBe(1);
    expect(r2.current.filtered[0].username).toBe('cristiano');
  });
});
