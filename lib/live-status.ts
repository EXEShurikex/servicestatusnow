export type LiveStatus = {
  slug: string;
  name: string;
  status: string; // "operational" | "degraded" | ...
};

export async function fetchLiveStatuses(): Promise<Record<string, string>> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/status/live`, {
    // Server-side cache for 60s
    next: { revalidate: 60 },
  });

  // If NEXT_PUBLIC_SITE_URL isn't set, fallback to relative fetch
  if (!res.ok) {
    const fallback = await fetch("/api/status/live", { next: { revalidate: 60 } });
    if (!fallback.ok) return {};
    const data = await fallback.json();
    return Object.fromEntries((data.services || []).map((s: LiveStatus) => [s.slug, s.status]));
  }

  const data = await res.json();
  return Object.fromEntries((data.services || []).map((s: LiveStatus) => [s.slug, s.status]));
}
