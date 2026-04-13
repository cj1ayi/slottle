export const HUB_ORIGIN = "https://archershub.dlsu.edu.ph"

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36"

export type HubResult =
  | { ok: true; text: string }
  | { ok: false; status: number; detail: string }

export async function hubFetch(
  path: string,
  opts: {
    cookie: string
    body?: string
    contentType?: string
  }
): Promise<HubResult> {
  const headers: Record<string, string> = {
    Cookie: opts.cookie,
    "Content-Type": opts.contentType ?? "application/x-www-form-urlencoded; charset=UTF-8",
    "X-Requested-With": "XMLHttpRequest",
    Accept: "*/*",
    "Accept-Language": "en-US,en;q=0.5",
    Origin: HUB_ORIGIN,
    Referer: `${HUB_ORIGIN}/`,
    "User-Agent": BROWSER_UA,
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
  }

  let res: Response
  try {
    res = await fetch(`${HUB_ORIGIN}${path}`, {
      method: "POST",
      headers,
      body: opts.body ?? "",
    })
  } catch (err) {
    return { ok: false, status: 502, detail: `Network error: ${String(err)}` }
  }

  const text = await res.text().catch(() => "")

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      detail: `HTTP ${res.status} — ${text.slice(0, 400)}`,
    }
  }

  return { ok: true, text }
}
