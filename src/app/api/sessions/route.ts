import type { NextRequest } from "next/server";
import { HUB_ORIGIN, hubFetch } from "@/lib/hub";

export const dynamic = "force-dynamic";

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36";

/** Parse <option value="N">Text</option> pairs from an HTML string. */
function parseOptions(html: string): { Value: string; Text: string }[] {
  const results: { Value: string; Text: string }[] = [];
  const re = /<option[^>]+value="(\d+)"[^>]*>(.*?)<\/option>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    results.push({ Value: m[1], Text: m[2].trim() });
  }
  return results;
}

export async function GET(request: NextRequest) {
  const cookie = request.headers.get("x-archers-cookie");
  if (!cookie) {
    return Response.json({ error: "Missing session cookie" }, { status: 401 });
  }

  // ── Strategy 1: scrape the CourseFinder page for the session <select> ───
  try {
    const pageRes = await fetch(`${HUB_ORIGIN}/CourseFinder`, {
      headers: {
        Cookie: cookie,
        Accept: "text/html,application/xhtml+xml,*/*",
        "User-Agent": BROWSER_UA,
      },
    });

    if (pageRes.ok) {
      const html = await pageRes.text();

      // Find a <select> whose name or id contains "session" (case-insensitive)
      const selectMatch = html.match(
        /<select[^>]+(?:name|id)="[^"]*[Ss]ession[^"]*"[^>]*>([\s\S]*?)<\/select>/i,
      );
      if (selectMatch) {
        const options = parseOptions(selectMatch[1]);
        if (options.length > 0) {
          return Response.json(options);
        }
      }
    }
  } catch {
    // fall through to strategy 2
  }

  // ── Strategy 2: call the API without a session to get SessionDrp ─────────
  const result = await hubFetch("/CourseFinder/GetCourseList/", {
    cookie,
    body: "Campusno=7",
  });

  if (result.ok) {
    try {
      const data = JSON.parse(result.text) as { SessionDrp?: unknown[] };
      const drp = data?.SessionDrp;
      if (Array.isArray(drp) && drp.length > 0) {
        // Normalise whatever shape it has
        const sessions = drp.map((item) => {
          const o = item as Record<string, unknown>;
          const keys = Object.keys(o);
          const valKey = keys.find((k) => /value|id/i.test(k)) ?? keys[0];
          const txtKey = keys.find((k) => /text|name/i.test(k)) ?? keys[1];
          return {
            Value: String(o[valKey] ?? ""),
            Text: String(o[txtKey] ?? ""),
          };
        });
        return Response.json(sessions);
      }
    } catch {
      // ignore
    }
  }

  // ── Strategy 3: nothing worked — return empty so the UI falls back ────────
  return Response.json([]);
}
