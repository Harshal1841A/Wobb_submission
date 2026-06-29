import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useProfileSearch } from './useProfileSearch';

describe('useProfileSearch', () => {
  it('filters profiles by query and brand affinity', () => {
    const brandAffinityMap = {
      cristiano: ['Nike'],
      instagram: ['Amazon', 'Coachella'],
    };

    const { result: r1 } = renderHook(() =>
      useProfileSearch('instagram', '', 'All', brandAffinityMap)
    );
    expect(r1.current.filtered.length).toBeGreaterThan(0);

    const { result: r2 } = renderHook(() =>
      useProfileSearch('instagram', '', 'Nike', brandAffinityMap)
    );
    expect(r2.current.filtered.length).toBe(1);
    expect(r2.current.filtered[0].username).toBe('cristiano');
  });
});
