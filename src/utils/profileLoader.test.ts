import { describe, it, expect } from 'vitest';
import { loadBrandAffinityIndex } from './profileLoader';

describe('profileLoader', () => {
  it('loads brand affinity index from profiles', async () => {
    const index = await loadBrandAffinityIndex();
    expect(index).toBeDefined();
    expect(index['cristiano']).toContain('Nike');
    expect(index['instagram']).toContain('Amazon');
  });
});
