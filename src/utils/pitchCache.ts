export const pitchCache = new Map<string, string>();

export function clearPitchCache(): void {
  pitchCache.clear();
}
