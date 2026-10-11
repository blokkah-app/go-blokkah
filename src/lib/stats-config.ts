/**
 * Tag for `unstable_cache` on sheet row count. Call `revalidateTag` with this after
 * appending a row so `/api/stats` returns an up-to-date count immediately.
 */
export const STATS_ROW_COUNT_CACHE_TAG = "blokkah-sheet-row-count";

/**
 * Base offset added to the number of data rows in the sheet for the public counter:
 * displayed "before you" = this value + sheetDataRows. Set to 0 to use only live rows.
 */
export function getCounterBaseOffset(): number {
  const raw = process.env.STATS_FALLBACK_BEFORE_COUNT ?? "363";
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}
