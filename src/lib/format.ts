/** Eastern Arabic numerals for display. */
export function formatArabicCount(n: number): string {
  try {
    return n.toLocaleString("ar-u-nu-arab", { useGrouping: false });
  } catch {
    return String(n);
  }
}
