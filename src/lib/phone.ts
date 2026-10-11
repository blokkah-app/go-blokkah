/** Normalize Saudi mobile to 05xxxxxxxx (10 digits). */
export function normalizeSaudiMobile(input: string): string {
  let s = input.replace(/\s+/g, "").replace(/-/g, "");
  if (s.startsWith("+966")) s = "0" + s.slice(4);
  if (s.startsWith("966")) s = "0" + s.slice(3);
  return s;
}

export function isValidSaudiMobile(normalized: string): boolean {
  return /^05\d{8}$/.test(normalized);
}
