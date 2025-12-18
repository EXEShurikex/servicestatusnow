export function statusLabel(status?: string) {
  return status ?? "unknown";
}

export function statusClasses(status?: string) {
  switch (status) {
    case "operational":
      return "bg-green-500/15 text-green-300 ring-1 ring-green-500/30";
    case "degraded":
    case "partial_outage":
      return "bg-yellow-500/15 text-yellow-300 ring-1 ring-yellow-500/30";
    case "major_outage":
      return "bg-red-500/15 text-red-300 ring-1 ring-red-500/30";
    case "maintenance":
      return "bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/30";
    default:
      return "bg-zinc-500/15 text-zinc-300 ring-1 ring-zinc-500/30";
  }
}
