export const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", // Indigo
  "linear-gradient(135deg, #ec4899 0%, #be185d 100%)", // Pink
  "linear-gradient(135deg, #10b981 0%, #047857 100%)", // Emerald
  "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)", // Amber
  "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", // Blue
  "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)", // Purple
  "linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)", // Teal
  "linear-gradient(135deg, #f43f5e 0%, #be123c 100%)", // Rose
];

export function getGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

export function getInitials(name?: string): string {
  if (!name || !name.trim()) return "";
  const cleaned = name.trim();
  
  // Ignore common stop words in multi-word names
  const stopWords = new Set(["and", "the", "of", "in", "&"]);
  const words = cleaned.split(/[\s-]+/).filter((w) => Boolean(w) && !stopWords.has(w.toLowerCase()));
  
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  
  if (words.length === 1) {
    const word = words[0];
    // If single word has uppercase letters inside (e.g. MrBeast -> MB, PewDiePie -> PD)
    const upperChars = word.split("").filter((c) => c >= "A" && c <= "Z");
    if (upperChars.length >= 2) {
      return (upperChars[0] + upperChars[1]).toUpperCase();
    }
    return word.slice(0, 2).toUpperCase();
  }
  
  return cleaned.slice(0, 2).toUpperCase();
}
