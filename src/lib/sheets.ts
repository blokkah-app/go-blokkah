import { createPrivateKey } from "node:crypto";
import { google } from "googleapis";

type ServiceAccountCreds = { clientEmail: string; privateKey: string };

/** Default tab for new spreadsheets (English UI). Override with GOOGLE_SHEET_*_RANGE if yours differs (e.g. ورقة1). */
const DEFAULT_SHEET_TAB = "Sheet1";

function normalizePrivateKey(raw: string): string {
  let k = raw.trim().replace(/^\uFEFF/, "");
  if (
    (k.startsWith('"') && k.endsWith('"')) ||
    (k.startsWith("'") && k.endsWith("'"))
  ) {
    k = k.slice(1, -1).trim();
  }
  k = k.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  // .env often stores PEM as one line with literal \n sequences
  k = k.replace(/\\n/g, "\n");
  k = k.replace(/\\r\\n/g, "\n");
  return k.trim();
}

function parseServiceAccountJson(text: string): ServiceAccountCreds | null {
  try {
    const o = JSON.parse(text) as {
      client_email?: string;
      private_key?: string;
    };
    if (
      typeof o.client_email === "string" &&
      typeof o.private_key === "string" &&
      o.client_email.length > 0 &&
      o.private_key.length > 0
    ) {
      return {
        clientEmail: o.client_email.trim(),
        privateKey: normalizePrivateKey(o.private_key),
      };
    }
  } catch {
    /* invalid JSON */
  }
  return null;
}

/** Resolves credentials from env without throwing (returns null if incomplete). */
export function resolveServiceAccountCredentials(): ServiceAccountCreds | null {
  const jsonB64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_B64?.trim();
  if (jsonB64) {
    try {
      const text = Buffer.from(jsonB64, "base64").toString("utf8");
      const c = parseServiceAccountJson(text);
      if (c) return c;
    } catch {
      /* ignore */
    }
  }

  const jsonRaw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (jsonRaw) {
    const c = parseServiceAccountJson(jsonRaw);
    if (c) return c;
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const pkB64 = process.env.GOOGLE_PRIVATE_KEY_BASE64?.trim();
  let privateKey: string | undefined;

  if (pkB64) {
    try {
      privateKey = normalizePrivateKey(
        Buffer.from(pkB64, "base64").toString("utf8"),
      );
    } catch {
      privateKey = undefined;
    }
  } else if (process.env.GOOGLE_PRIVATE_KEY) {
    privateKey = normalizePrivateKey(process.env.GOOGLE_PRIVATE_KEY);
  }

  if (email && privateKey) {
    return { clientEmail: email, privateKey };
  }
  return null;
}

function assertDecodablePrivateKey(pem: string): void {
  try {
    createPrivateKey(pem);
  } catch {
    throw new Error(
      "Invalid GOOGLE_PRIVATE_KEY: OpenSSL could not decode the PEM. " +
        "Fix: use one line with \\n for newlines, or set GOOGLE_PRIVATE_KEY_BASE64 " +
        "(base64 of the full PEM file text), or set GOOGLE_SERVICE_ACCOUNT_JSON_B64 " +
        "(base64 of the whole service-account .json). " +
        "Avoid pasting multi-line PEM unquoted in .env (only the first line may load).",
    );
  }
}

function getSheetsClient() {
  const creds = resolveServiceAccountCredentials();
  if (!creds) return null;

  assertDecodablePrivateKey(creds.privateKey);

  const auth = new google.auth.JWT({
    email: creds.clientEmail,
    key: creds.privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

function sheetsErrorText(err: unknown): string {
  if (!err || typeof err !== "object") return "";
  const e = err as {
    message?: string;
    cause?: { message?: string; status?: string };
  };
  return `${e.message ?? ""} ${e.cause?.message ?? ""}`.toLowerCase();
}

/** Maps Google Sheets / gaxios errors to a small set for API responses. */
export function classifySheetsApiError(
  err: unknown,
): "permission_denied" | "not_found" | "invalid_range" | "unknown" {
  if (!err || typeof err !== "object") return "unknown";
  const e = err as {
    code?: number;
    response?: { status?: number };
    cause?: {
      code?: number;
      status?: string;
      message?: string;
      errors?: Array<{ reason?: string; message?: string }>;
    };
  };
  const httpStatus = e.response?.status ?? (typeof e.code === "number" ? e.code : undefined);
  const text = sheetsErrorText(err);
  if (httpStatus === 400 && text.includes("unable to parse range")) {
    return "invalid_range";
  }
  if (httpStatus === 403) return "permission_denied";
  if (httpStatus === 404) return "not_found";
  const c = e.cause;
  if (c?.status === "PERMISSION_DENIED" || c?.code === 403) {
    return "permission_denied";
  }
  if (c?.status === "NOT_FOUND" || c?.code === 404) return "not_found";
  const reason = c?.errors?.[0]?.reason;
  if (reason === "forbidden" || reason === "PERMISSION_DENIED") {
    return "permission_denied";
  }
  if (reason === "notFound") return "not_found";
  return "unknown";
}

export function sheetsConfigured(): boolean {
  if (!process.env.GOOGLE_SHEET_ID?.trim()) return false;
  const creds = resolveServiceAccountCredentials();
  if (!creds) return false;
  try {
    assertDecodablePrivateKey(creds.privateKey);
    return true;
  } catch {
    return false;
  }
}

/** Data rows only (excludes header rows). */
export async function getDataRowCount(): Promise<number> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const range =
    process.env.GOOGLE_SHEET_COUNT_RANGE ??
    process.env.GOOGLE_SHEET_RANGE ??
    `${DEFAULT_SHEET_TAB}!A:A`;
  const headerRows = Math.max(
    0,
    parseInt(process.env.GOOGLE_SHEET_HEADER_ROWS ?? "1", 10),
  );

  const sheets = getSheetsClient();
  if (!sheets || !sheetId) {
    throw new Error("Sheets not configured");
  }

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range,
  });

  const values = res.data.values ?? [];
  const occupied = values.filter(
    (row) => row[0] != null && String(row[0]).trim() !== "",
  ).length;

  return Math.max(0, occupied - headerRows);
}

export async function appendResponseRow(cells: string[]): Promise<void> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const range =
    process.env.GOOGLE_SHEET_APPEND_RANGE ?? `${DEFAULT_SHEET_TAB}!A:E`;
  const sheets = getSheetsClient();
  if (!sheets || !sheetId) {
    throw new Error("Sheets not configured");
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [cells],
    },
  });
}
