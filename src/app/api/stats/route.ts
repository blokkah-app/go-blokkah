import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { getDataRowCount, sheetsConfigured } from "@/lib/sheets";
import {
  getCounterBaseOffset,
  STATS_ROW_COUNT_CACHE_TAG,
} from "@/lib/stats-config";

const getCachedRowCount = unstable_cache(
  async () => getDataRowCount(),
  ["blokkah-sheet-data-rows"],
  { revalidate: 30, tags: [STATS_ROW_COUNT_CACHE_TAG] },
);

export async function GET() {
  const base = getCounterBaseOffset();

  try {
    if (!sheetsConfigured()) {
      return NextResponse.json({
        beforeYouCount: base,
        sheetRows: 0,
        demo: true,
      });
    }

    const sheetRows = await getCachedRowCount();
    return NextResponse.json({
      beforeYouCount: base + sheetRows,
      sheetRows,
      demo: false,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        beforeYouCount: base,
        sheetRows: 0,
        demo: true,
        error: "stats_unavailable",
      },
      { status: 200 },
    );
  }
}
