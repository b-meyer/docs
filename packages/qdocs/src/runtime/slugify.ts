export function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replaceAll(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .replaceAll(/\s+/gu, '-');
}
