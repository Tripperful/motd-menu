export const colorByRank = (
  rank: string,
): { r: number; g: number; b: number } => {
  rank = rank.toLowerCase();

  if (rank.includes('bronze')) return { r: 205, g: 127, b: 50 };
  if (rank.includes('silver')) return { r: 192, g: 192, b: 192 };
  if (rank.includes('gold')) return { r: 255, g: 215, b: 0 };
  if (rank.includes('platinum')) return { r: 229, g: 228, b: 226 };
  if (rank.includes('pro')) return { r: 255, g: 0, b: 0 };

  return { r: 255, g: 255, b: 255 };
};
