import { describe, it, expect } from 'vitest';
import { loadProfileByUsername } from './profileLoader';

describe('profileLoader', () => {
  it('loads profile detail data by username', async () => {
    const profile = await loadProfileByUsername('cristiano');
    expect(profile).toBeDefined();
    expect(profile?.data?.user_profile?.username).toBe('cristiano');
  });

  it('returns null for non-existent username', async () => {
    const profile = await loadProfileByUsername('non_existent_user_12345');
    expect(profile).toBeNull();
  });
});
