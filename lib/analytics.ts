import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data", "analytics");

export type AnalyticsEvent = {
  ts: string;
  event: string;
  trial: string;
  sid?: string;
  ip?: string;
  ua?: string;
  ref?: string;
  utm?: Record<string, string>;
  zip?: string;
  price?: number;
  lead_id?: string;
  reason?: string;
  question?: string;
  trialSiteId?: string;
  affId?: string;
  clickId?: string;
  [key: string]: unknown;
};

const ALLOWED_EVENTS = new Set([
  "page_visit",
  "form_start",
  "screening_complete",
  "screening_disqualified",
  "zip_rejected",
  "details_1_complete",
  "details_2a_complete",
  "details_2b_complete",
  "consent_complete",
  "lead_submitted",
  "lead_accepted",
  "lead_failed",
  "relay_success",
  "relay_failed",
]);

export function isAllowedEvent(event: string): boolean {
  return ALLOWED_EVENTS.has(event);
}

const TZ = "Australia/Sydney";

export function sydneyDate(d: Date = new Date()): string {
  return d.toLocaleDateString("en-CA", { timeZone: TZ });
}

export function sydneyTimestamp(d: Date = new Date()): string {
  return d.toLocaleString("sv-SE", { timeZone: TZ }).replace(" ", "T") + "+10:00";
}

function todayFile(): string {
  return path.join(DATA_DIR, `${sydneyDate()}.ndjson`);
}

function fileForDate(date: string): string {
  return path.join(DATA_DIR, `${date}.ndjson`);
}

export function trackEvent(
  event: string,
  data: Omit<AnalyticsEvent, "ts" | "event"> & { trial: string }
): void {
  const line: AnalyticsEvent = {
    ts: sydneyTimestamp(),
    event,
    ...data,
  };

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.appendFileSync(todayFile(), JSON.stringify(line) + "\n");
  } catch (err) {
    console.error("Analytics write failed:", err);
  }
}

export function readEvents(dateFrom?: string, dateTo?: string): AnalyticsEvent[] {
  if (!fs.existsSync(DATA_DIR)) return [];

  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".ndjson")).sort();
  const events: AnalyticsEvent[] = [];

  for (const file of files) {
    const date = file.replace(".ndjson", "");
    if (dateFrom && date < dateFrom) continue;
    if (dateTo && date > dateTo) continue;

    const filePath = fileForDate(date);
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      for (const line of content.split("\n")) {
        if (!line.trim()) continue;
        try {
          events.push(JSON.parse(line));
        } catch {
          // skip malformed lines
        }
      }
    } catch {
      // skip unreadable files
    }
  }

  return events;
}

export type FunnelStep = {
  label: string;
  event: string;
  count: number;
  pct: number;
};

export type DailyRow = {
  date: string;
  visits: number;
  formStarts: number;
  submitted: number;
  accepted: number;
  revenue: number;
  conversion: number;
};

export type FailureReasonCount = {
  reason: string;
  count: number;
};

export type AffBreakdownRow = {
  affId: string;
  visits: number;
  accepted: number;
  revenue: number;
  conversion: number;
};

/** Resolve traffic-source tag from explicit field or referrer URL. */
export function resolveAffId(ev: AnalyticsEvent): string {
  if (ev.affId && String(ev.affId).trim()) return String(ev.affId);
  if (ev.ref) {
    try {
      const aff = new URL(ev.ref).searchParams.get("aff_id");
      if (aff?.trim()) return aff;
    } catch {
      // ignore malformed ref
    }
  }
  return "(direct / unknown)";
}

export type AggregatedStats = {
  visits: number;
  formStarts: number;
  screeningComplete: number;
  screeningDisqualified: number;
  zipRejected: number;
  details1Complete: number;
  details2aComplete: number;
  details2bComplete: number;
  consentComplete: number;
  leadsSubmitted: number;
  leadsAccepted: number;
  leadsFailed: number;
  relaySuccess: number;
  relayFailed: number;
  totalRevenue: number;
  conversionRate: number;
  funnel: FunnelStep[];
  daily: DailyRow[];
  failureReasons: FailureReasonCount[];
  affBreakdown: AffBreakdownRow[];
};

function parsePrice(price: unknown): number {
  if (typeof price === "number") return price;
  if (typeof price === "string") {
    const n = parseFloat(price);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

export function aggregateStats(events: AnalyticsEvent[]): AggregatedStats {
  const counts: Record<string, number> = {};
  let totalRevenue = 0;
  const dailyMap = new Map<string, { visits: number; formStarts: number; submitted: number; accepted: number; revenue: number }>();
  const failReasonMap = new Map<string, number>();
  const affMap = new Map<string, { visits: number; accepted: number; revenue: number }>();

  for (const ev of events) {
    counts[ev.event] = (counts[ev.event] || 0) + 1;
    if (ev.event === "lead_accepted") {
      totalRevenue += parsePrice(ev.price);
    }
    if ((ev.event === "lead_failed" || ev.event === "relay_failed") && ev.reason) {
      const r = String(ev.reason);
      failReasonMap.set(r, (failReasonMap.get(r) || 0) + 1);
    }

    const date = ev.ts.slice(0, 10);
    if (!dailyMap.has(date)) {
      dailyMap.set(date, { visits: 0, formStarts: 0, submitted: 0, accepted: 0, revenue: 0 });
    }
    const day = dailyMap.get(date)!;
    if (ev.event === "page_visit") day.visits++;
    if (ev.event === "form_start") day.formStarts++;
    if (ev.event === "lead_submitted") day.submitted++;
    if (ev.event === "lead_accepted") {
      day.accepted++;
      day.revenue += parsePrice(ev.price);
    }

    if (ev.event === "page_visit" || ev.event === "lead_accepted") {
      const aff = resolveAffId(ev);
      if (!affMap.has(aff)) {
        affMap.set(aff, { visits: 0, accepted: 0, revenue: 0 });
      }
      const row = affMap.get(aff)!;
      if (ev.event === "page_visit") row.visits++;
      if (ev.event === "lead_accepted") {
        row.accepted++;
        row.revenue += parsePrice(ev.price);
      }
    }
  }

  const c = (e: string) => counts[e] || 0;
  const visits = c("page_visit");

  const funnelDef: { label: string; event: string }[] = [
    { label: "Page Visits", event: "page_visit" },
    { label: "Form Started", event: "form_start" },
    { label: "Screening Passed", event: "screening_complete" },
    { label: "Contact Info", event: "details_1_complete" },
    { label: "Personal Details", event: "details_2a_complete" },
    { label: "Ethnicity / Doctor", event: "details_2b_complete" },
    { label: "Consent Given", event: "consent_complete" },
    { label: "Lead Submitted", event: "lead_submitted" },
    { label: "Lead Accepted", event: "lead_accepted" },
  ];

  const funnel: FunnelStep[] = funnelDef.map((f) => ({
    ...f,
    count: c(f.event),
    pct: visits > 0 ? Math.round((c(f.event) / visits) * 100) : 0,
  }));

  const daily: DailyRow[] = Array.from(dailyMap.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, d]) => ({
      date,
      ...d,
      conversion: d.visits > 0 ? Math.round((d.accepted / d.visits) * 100) : 0,
    }));

  return {
    visits,
    formStarts: c("form_start"),
    screeningComplete: c("screening_complete"),
    screeningDisqualified: c("screening_disqualified"),
    zipRejected: c("zip_rejected"),
    details1Complete: c("details_1_complete"),
    details2aComplete: c("details_2a_complete"),
    details2bComplete: c("details_2b_complete"),
    consentComplete: c("consent_complete"),
    leadsSubmitted: c("lead_submitted"),
    leadsAccepted: c("lead_accepted"),
    leadsFailed: c("lead_failed"),
    relaySuccess: c("relay_success"),
    relayFailed: c("relay_failed"),
    totalRevenue,
    conversionRate: visits > 0 ? Math.round((c("lead_accepted") / visits) * 100) : 0,
    funnel,
    daily,
    failureReasons: Array.from(failReasonMap.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([reason, count]) => ({ reason, count })),
    affBreakdown: Array.from(affMap.entries())
      .sort(([, a], [, b]) => b.revenue - a.revenue || b.visits - a.visits)
      .map(([affId, d]) => ({
        affId,
        visits: d.visits,
        accepted: d.accepted,
        revenue: d.revenue,
        conversion: d.visits > 0 ? Math.round((d.accepted / d.visits) * 100) : 0,
      })),
  };
}
