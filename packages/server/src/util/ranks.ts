export const colorByRank = (
  rank: string,
): { r: number; g: number; b: number } => {
  rank = rank.toLowerCase();

  if (rank.includes('iron')) return { r: 125, g: 43, b: 0 };
  if (rank.includes('bronze')) return { r: 187, g: 119, b: 62 };
  if (rank.includes('silver')) return { r: 167, g: 167, b: 167 };
  if (rank.includes('gold')) return { r: 238, g: 175, b: 55 };
  if (rank.includes('platinum')) return { r: 50, g: 204, b: 179 };
  if (rank.includes('cobalt')) return { r: 0, g: 124, b: 251 };
  if (rank.includes('pro')) return { r: 200, g: 14, b: 14 };

  return { r: 255, g: 255, b: 255 };
};
