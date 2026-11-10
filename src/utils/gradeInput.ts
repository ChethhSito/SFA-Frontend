/** Empty or invalid input never becomes a recorded zero. */
export function parseGradeInput(raw: string): number | null {
  const normalized = raw.trim().replace(",", ".");
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) return null;
  const score = Number(normalized);
  return Number.isFinite(score) && score >= 0 && score <= 20 ? score : null;
}
