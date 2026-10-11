import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import {
  appendResponseRow,
  classifySheetsApiError,
  resolveServiceAccountCredentials,
  sheetsConfigured,
} from "@/lib/sheets";
import { isValidSaudiMobile, normalizeSaudiMobile } from "@/lib/phone";
import type { RoleId } from "@/lib/content";
import { ROLES } from "@/lib/content";
import { STATS_ROW_COUNT_CACHE_TAG } from "@/lib/stats-config";

const ROLE_SET = new Set<RoleId>(ROLES.map((r) => r.id));

type Body = {
  name?: string;
  phone?: string;
  role?: string;
  website?: string;
};

function roleLabel(id: RoleId): string {
  return ROLES.find((r) => r.id === id)?.label ?? id;
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (body.website && String(body.website).trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const name = String(body.name ?? "").trim();
  const phoneRaw = String(body.phone ?? "");
  const phone = normalizeSaudiMobile(phoneRaw);
  const role = body.role as RoleId | undefined;

  if (name.length < 2 || name.length > 120) {
    return NextResponse.json({ ok: false, error: "invalid_name" }, { status: 400 });
  }

  if (!isValidSaudiMobile(phone)) {
    return NextResponse.json({ ok: false, error: "invalid_phone" }, { status: 400 });
  }

  if (!role || !ROLE_SET.has(role)) {
    return NextResponse.json({ ok: false, error: "invalid_role" }, { status: 400 });
  }

  const sheetId = process.env.GOOGLE_SHEET_ID?.trim();
  const creds = resolveServiceAccountCredentials();

  if (!sheetId || !creds) {
    console.warn("submit: sheets not configured, skipping append");
    return NextResponse.json({ ok: true, demo: true });
  }

  if (!sheetsConfigured()) {
    console.error(
      "submit: Google credentials present but private key is invalid or undecodable (check .env PEM / base64 / JSON).",
    );
    return NextResponse.json(
      { ok: false, error: "google_credentials_invalid" },
      { status: 503 },
    );
  }

  const ua = request.headers.get("user-agent") ?? "";

  try {
    await appendResponseRow([
      new Date().toISOString(),
      name,
      phone,
      roleLabel(role),
      ua.slice(0, 500),
    ]);
  } catch (e) {
    console.error(e);
    const kind = classifySheetsApiError(e);
    if (kind === "permission_denied") {
      return NextResponse.json(
        { ok: false, error: "sheet_permission_denied" },
        { status: 403 },
      );
    }
    if (kind === "not_found") {
      return NextResponse.json(
        { ok: false, error: "sheet_not_found" },
        { status: 404 },
      );
    }
    if (kind === "invalid_range") {
      return NextResponse.json(
        { ok: false, error: "sheet_range_invalid" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { ok: false, error: "sheet_write_failed" },
      { status: 502 },
    );
  }

  revalidateTag(STATS_ROW_COUNT_CACHE_TAG, "default");
  return NextResponse.json({ ok: true, demo: false });
}
