// lib/status-checker.ts
// ServiceStatusNow - Live status checker utilities
// Next.js App Router safe (runs on server). No DOM APIs.

export type ServiceStatus =
  | "operational"
  | "degraded"
  | "partial_outage"
  | "major_outage"
  | "maintenance"
  | "unknown";

export type StatusResult = {
  service: string;
  status: ServiceStatus;
  source: "official" | "unknown";
  statusPageUrl: string;
  httpStatus?: number;
  lastChecked: string;
  details?: string;
};

export const STATUS_PAGE_SOURCES: Record<string, string> = {
  discord: "https://discordstatus.com",
  github: "https://www.githubstatus.com",
  cloudflare: "https://www.cloudflarestatus.com",
  twitch: "https://status.twitch.tv",
  reddit: "https://www.redditstatus.com",
  dropbox: "https://status.dropbox.com",
  vercel: "https://www.vercel-status.com",
  netlify: "https://www.netlifystatus.com",
  notion: "https://status.notion.so",
  figma: "https://status.figma.com",
  zoom: "https://status.zoom.us",
  stripe: "https://status.stripe.com",
};

type Provider =
  | "atlassian_statuspage"
  | "instatus"
  | "betterstack"
  | "cachet"
  | "statusio"
  | "unknown";

const DEFAULT_TIMEOUT_MS = 8000;
const MAX_CONCURRENCY = 6;

/**
 * Public: fetch all configured slugs -> status string.
 * This is what your route.ts is calling.
 */
export async function fetchAllStatuses(): Promise<Record<string, ServiceStatus>> {
  const entries = Object.entries(STATUS_PAGE_SOURCES);

  const results = await mapWithConcurrency(entries, MAX_CONCURRENCY, async ([slug, url]) => {
    const res = await checkLiveStatus(slug, url);
    return [slug, res.status] as const;
  });

  return Object.fromEntries(results);
}

/**
 * Public: check one service by name + status page URL.
 * Returns normalized status + metadata.
 */
export async function checkLiveStatus(serviceName: string, statusPageUrl: string): Promise<StatusResult> {
  const lastChecked = new Date().toISOString();

  if (!statusPageUrl || typeof statusPageUrl !== "string") {
    return {
      service: serviceName,
      status: "unknown",
      source: "unknown",
      statusPageUrl: statusPageUrl || "",
      lastChecked,
      details: "Missing status page URL",
    };
  }

  const provider = detectProvider(statusPageUrl);

  // Try provider-specific JSON endpoints first (most reliable).
  try {
    const jsonResult = await tryProviderJson(provider, statusPageUrl, serviceName);
    if (jsonResult) return jsonResult;
  } catch {
    // fall through to HTML heuristic
  }

  // Fallback: fetch HTML and use keyword heuristics.
  try {
    const html = await safeFetchText(statusPageUrl, DEFAULT_TIMEOUT_MS);
    const normalized = normalizeFromHtml(html);
    return {
      service: serviceName,
      status: normalized,
      source: normalized === "unknown" ? "unknown" : "official",
      statusPageUrl,
      lastChecked,
      details: provider === "unknown" ? "HTML heuristic" : `${provider} HTML heuristic`,
    };
  } catch (err: any) {
    return {
      service: serviceName,
      status: "unknown",
      source: "unknown",
      statusPageUrl,
      lastChecked,
      details: `Fetch failed: ${String(err?.message || err)}`,
    };
  }
}

/**
 * Public: check a list of services at once.
 */
export async function checkMultipleServices(
  services: Array<{ name: string; statusPageUrl: string }>
): Promise<StatusResult[]> {
  return mapWithConcurrency(services, MAX_CONCURRENCY, async (s) => checkLiveStatus(s.name, s.statusPageUrl));
}

/* ----------------------------- Provider logic ----------------------------- */

function detectProvider(statusPageUrl: string): Provider {
  const u = safeUrl(statusPageUrl);
  if (!u) return "unknown";

  const host = u.hostname.toLowerCase();

  // Atlassian Statuspage usually uses these patterns and supports /api/v2/summary.json
  // Many branded status sites still are Statuspage under the hood.
  if (
    host.includes("statuspage.io") ||
    host.includes("githubstatus.com") ||
    host.includes("cloudflarestatus.com") ||
    host.includes("discordstatus.com") ||
    host.includes("redditstatus.com") ||
    host.includes("netlifystatus.com") ||
    host.includes("status.zoom.us") ||
    host.includes("status.dropbox.com") ||
    host.includes("status.figma.com") ||
    host.includes("status.notion.so") ||
    host.includes("status.stripe.com") ||
    host.includes("status.twitch.tv") ||
    host.includes("vercel-status.com")
  ) {
    return "atlassian_statuspage";
  }

  if (host.includes("instatus.com")) return "instatus";
  if (host.includes("betterstack.com")) return "betterstack";
  if (host.includes("cachethq.io") || host.includes("cachet")) return "cachet";
  if (host.includes("status.io")) return "statusio";

  return "unknown";
}

async function tryProviderJson(
  provider: Provider,
  statusPageUrl: string,
  serviceName: string
): Promise<StatusResult | null> {
  const lastChecked = new Date().toISOString();

  if (provider === "atlassian_statuspage") {
    // Statuspage API v2: /api/v2/summary.json or /api/v2/status.json
    const summaryUrl = joinUrl(statusPageUrl, "/api/v2/summary.json");
    const statusUrl = joinUrl(statusPageUrl, "/api/v2/status.json");

    // Try summary first (has overall + components)
    const summary = await safeFetchJson<any>(summaryUrl, DEFAULT_TIMEOUT_MS).catch(() => null);
    if (summary) {
      const indicator: string | undefined =
        summary?.status?.indicator || summary?.page?.status_indicator || summary?.status?.description;
      const desc: string | undefined = summary?.status?.description;

      const status = normalizeFromStatuspageIndicator(indicator, desc);
      return {
        service: serviceName,
        status,
        source: status === "unknown" ? "unknown" : "official",
        statusPageUrl,
        httpStatus: 200,
        lastChecked,
        details: "Statuspage summary.json",
      };
    }

    // Fallback to status.json
    const statusJson = await safeFetchJson<any>(statusUrl, DEFAULT_TIMEOUT_MS).catch(() => null);
    if (statusJson) {
      const indicator: string | undefined = statusJson?.status?.indicator;
      const desc: string | undefined = statusJson?.status?.description;
      const status = normalizeFromStatuspageIndicator(indicator, desc);
      return {
        service: serviceName,
        status,
        source: status === "unknown" ? "unknown" : "official",
        statusPageUrl,
        httpStatus: 200,
        lastChecked,
        details: "Statuspage status.json",
      };
    }

    return null;
  }

  if (provider === "instatus") {
    // Instatus often has /api/summary (not universal); try a couple common ones.
    const candidates = [
      joinUrl(statusPageUrl, "/api/summary"),
      joinUrl(statusPageUrl, "/api/status"),
      joinUrl(statusPageUrl, "/api/v1/status"),
    ];

    for (const url of candidates) {
      const j = await safeFetchJson<any>(url, DEFAULT_TIMEOUT_MS).catch(() => null);
      if (!j) continue;

      const raw = (j?.status || j?.page?.status || j?.summary?.status || "").toString().toLowerCase();
      const status = normalizeSimpleWord(raw);
      return {
        service: serviceName,
        status,
        source: status === "unknown" ? "unknown" : "official",
        statusPageUrl,
        httpStatus: 200,
        lastChecked,
        details: "Instatus JSON",
      };
    }
    return null;
  }

  if (provider === "betterstack") {
    // Better Stack has APIs but often needs auth; treat as unknown unless HTML works.
    return null;
  }

  if (provider === "cachet") {
    // Cachet: /api/v1/status
    const url = joinUrl(statusPageUrl, "/api/v1/status");
    const j = await safeFetchJson<any>(url, DEFAULT_TIMEOUT_MS).catch(() => null);
    if (!j) return null;

    // Cachet returns { data: { indicator: "none|minor|major|critical", description: "..." } }
    const indicator = (j?.data?.indicator || "").toString().toLowerCase();
    const desc = (j?.data?.description || "").toString();
    const status = normalizeCachetIndicator(indicator, desc);
    return {
      service: serviceName,
      status,
      source: status === "unknown" ? "unknown" : "official",
      statusPageUrl,
      httpStatus: 200,
      lastChecked,
      details: "Cachet /api/v1/status",
    };
  }

  if (provider === "statusio") {
    // status.io typically requires API keys for JSON; fallback to HTML.
    return null;
  }

  return null;
}

/* ----------------------------- Normalization ----------------------------- */

function normalizeFromStatuspageIndicator(indicator?: string, description?: string): ServiceStatus {
  const i = (indicator || "").toLowerCase().trim();
  const d = (description || "").toLowerCase().trim();

  // Statuspage indicator values: none, minor, major, critical, maintenance (varies)
  if (i === "none") return "operational";
  if (i === "minor") return "degraded";
  if (i === "major") return "major_outage";
  if (i === "critical") return "major_outage";
  if (i === "maintenance") return "maintenance";

  // Sometimes only description is meaningful
  return normalizeFromText(`${i} ${d}`);
}

function normalizeCachetIndicator(indicator?: string, description?: string): ServiceStatus {
  const i = (indicator || "").toLowerCase().trim();
  if (i === "none") return "operational";
  if (i === "minor") return "degraded";
  if (i === "major") return "major_outage";
  if (i === "critical") return "major_outage";
  return normalizeFromText(`${i} ${description || ""}`);
}

function normalizeFromHtml(html: string): ServiceStatus {
  // Keep it simple: scan for common phrases on many status pages.
  const text = stripHtml(html).toLowerCase();

  // Strong signals
  if (text.includes("all systems operational") || text.includes("all systems are operational")) return "operational";
  if (text.includes("major outage") || text.includes("service disruption") || text.includes("service down"))
    return "major_outage";
  if (text.includes("partial outage")) return "partial_outage";
  if (text.includes("degraded performance") || text.includes("performance issues") || text.includes("intermittent"))
    return "degraded";
  if (text.includes("maintenance") || text.includes("scheduled maintenance") || text.includes("under maintenance"))
    return "maintenance";

  // Some status sites show a colored label per component; look for common keywords.
  const status = normalizeFromText(text);
  return status;
}

function normalizeFromText(text: string): ServiceStatus {
  const t = (text || "").toLowerCase();

  // Operational
  if (t.includes("operational") || t.includes("no incidents") || t.includes("working normally")) return "operational";

  // Maintenance
  if (t.includes("maintenance") || t.includes("scheduled")) return "maintenance";

  // Outages
  if (t.includes("critical") || t.includes("outage") || t.includes("down") || t.includes("unavailable"))
    return "major_outage";

  // Partial / degraded
  if (t.includes("partial")) return "partial_outage";
  if (t.includes("degraded") || t.includes("minor") || t.includes("intermittent") || t.includes("disruption"))
    return "degraded";

  return "unknown";
}

function normalizeSimpleWord(word: string): ServiceStatus {
  const w = (word || "").toLowerCase().trim();
  if (!w) return "unknown";
  if (w.includes("operational") || w === "ok" || w === "up") return "operational";
  if (w.includes("maintenance")) return "maintenance";
  if (w.includes("partial")) return "partial_outage";
  if (w.includes("degraded") || w.includes("minor")) return "degraded";
  if (w.includes("outage") || w.includes("down") || w.includes("major") || w.includes("critical")) return "major_outage";
  return "unknown";
}

/* ------------------------------ Fetch helpers ----------------------------- */

async function safeFetchText(url: string, timeoutMs: number): Promise<string> {
  const res = await safeFetch(url, timeoutMs);
  const text = await res.text();
  return text;
}

async function safeFetchJson<T>(url: string, timeoutMs: number): Promise<T> {
  const res = await safeFetch(url, timeoutMs);
  return (await res.json()) as T;
}

async function safeFetch(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent": "ServiceStatusNow/1.0 (+https://servicestatusnow.vercel.app)",
        Accept: "text/html,application/json;q=0.9,*/*;q=0.8",
      },
      // Always fetch fresh (route-level caching is handled by Next.js revalidate/dynamic)
      cache: "no-store",
    });

    return res;
  } finally {
    clearTimeout(t);
  }
}

/* ------------------------------ Misc helpers ------------------------------ */

function safeUrl(input: string): URL | null {
  try {
    return new URL(input);
  } catch {
    return null;
  }
}

function joinUrl(base: string, path: string): string {
  const u = safeUrl(base);
  if (!u) return base;
  // Ensure base has no trailing slash duplication
  const baseOrigin = `${u.protocol}//${u.host}`;
  const basePath = u.pathname.replace(/\/+$/, "");
  const full = `${baseOrigin}${basePath}${path.startsWith("/") ? path : `/${path}`}`;
  return full;
}

function stripHtml(html: string): string {
  // Very lightweight strip (good enough for heuristics)
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let idx = 0;

  const workers = new Array(Math.max(1, limit)).fill(0).map(async () => {
    while (true) {
      const current = idx++;
      if (current >= items.length) break;
      results[current] = await mapper(items[current], current);
    }
  });

  await Promise.all(workers);
  return results;
}
