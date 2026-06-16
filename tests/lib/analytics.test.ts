import { describe, it, expect } from "vitest";
import { aggregateStats, resolveAffId, type AnalyticsEvent } from "@/lib/analytics";

function makeEvent(event: string, overrides: Partial<AnalyticsEvent> = {}): AnalyticsEvent {
  return {
    ts: "2026-06-16T10:00:00+10:00",
    event,
    trial: "ckd14",
    ...overrides,
  };
}

describe("aggregateStats", () => {
  it("returns zeroes for an empty event list", () => {
    const stats = aggregateStats([]);
    expect(stats.visits).toBe(0);
    expect(stats.leadsAccepted).toBe(0);
    expect(stats.totalRevenue).toBe(0);
    expect(stats.conversionRate).toBe(0);
  });

  it("counts each event type correctly", () => {
    const events: AnalyticsEvent[] = [
      makeEvent("page_visit"),
      makeEvent("page_visit"),
      makeEvent("form_start"),
      makeEvent("screening_complete"),
      makeEvent("lead_submitted"),
      makeEvent("lead_accepted", { price: 50 }),
    ];
    const stats = aggregateStats(events);
    expect(stats.visits).toBe(2);
    expect(stats.formStarts).toBe(1);
    expect(stats.screeningComplete).toBe(1);
    expect(stats.leadsSubmitted).toBe(1);
    expect(stats.leadsAccepted).toBe(1);
  });

  it("sums revenue from lead_accepted events", () => {
    const events: AnalyticsEvent[] = [
      makeEvent("lead_accepted", { price: 40 }),
      makeEvent("lead_accepted", { price: 60 }),
      makeEvent("lead_accepted", { price: 25 }),
    ];
    const stats = aggregateStats(events);
    expect(stats.totalRevenue).toBe(125);
  });

  it("calculates conversion rate as accepted / visits * 100 (rounded)", () => {
    const events: AnalyticsEvent[] = [
      ...Array(10).fill(makeEvent("page_visit")),
      makeEvent("lead_accepted", { price: 50 }),
      makeEvent("lead_accepted", { price: 50 }),
    ];
    const stats = aggregateStats(events);
    expect(stats.conversionRate).toBe(20); // 2/10 = 20%
  });

  it("aggregates failure reasons across lead_failed and relay_failed", () => {
    const events: AnalyticsEvent[] = [
      makeEvent("lead_failed", { reason: "Duplicate Lead" }),
      makeEvent("lead_failed", { reason: "Duplicate Lead" }),
      makeEvent("lead_failed", { reason: "No Available Contracts" }),
      makeEvent("relay_failed", { reason: "Invalid site" }),
    ];
    const stats = aggregateStats(events);
    const byReason = Object.fromEntries(stats.failureReasons.map((r) => [r.reason, r.count]));
    expect(byReason["Duplicate Lead"]).toBe(2);
    expect(byReason["No Available Contracts"]).toBe(1);
    expect(byReason["Invalid site"]).toBe(1);
  });

  it("sorts failure reasons by count descending", () => {
    const events: AnalyticsEvent[] = [
      makeEvent("lead_failed", { reason: "Rare" }),
      makeEvent("lead_failed", { reason: "Common" }),
      makeEvent("lead_failed", { reason: "Common" }),
      makeEvent("lead_failed", { reason: "Common" }),
    ];
    const stats = aggregateStats(events);
    expect(stats.failureReasons[0].reason).toBe("Common");
    expect(stats.failureReasons[1].reason).toBe("Rare");
  });

  it("builds funnel steps with percentage relative to visits", () => {
    const events: AnalyticsEvent[] = [
      ...Array(100).fill(makeEvent("page_visit")),
      ...Array(50).fill(makeEvent("form_start")),
      ...Array(20).fill(makeEvent("lead_accepted", { price: 10 })),
    ];
    const stats = aggregateStats(events);
    const visitStep = stats.funnel.find((f) => f.event === "page_visit")!;
    const startStep = stats.funnel.find((f) => f.event === "form_start")!;
    const acceptedStep = stats.funnel.find((f) => f.event === "lead_accepted")!;
    expect(visitStep.pct).toBe(100);
    expect(startStep.pct).toBe(50);
    expect(acceptedStep.pct).toBe(20);
  });

  it("groups daily breakdown by date from timestamp", () => {
    const events: AnalyticsEvent[] = [
      makeEvent("page_visit", { ts: "2026-06-15T10:00:00+10:00" }),
      makeEvent("page_visit", { ts: "2026-06-15T11:00:00+10:00" }),
      makeEvent("page_visit", { ts: "2026-06-16T09:00:00+10:00" }),
      makeEvent("lead_accepted", { ts: "2026-06-15T12:00:00+10:00", price: 50 }),
    ];
    const stats = aggregateStats(events);
    const day15 = stats.daily.find((d) => d.date === "2026-06-15")!;
    const day16 = stats.daily.find((d) => d.date === "2026-06-16")!;
    expect(day15.visits).toBe(2);
    expect(day15.accepted).toBe(1);
    expect(day15.revenue).toBe(50);
    expect(day16.visits).toBe(1);
  });

  it("groups traffic by aff_id from explicit field or referrer", () => {
    const events: AnalyticsEvent[] = [
      makeEvent("page_visit", { affId: "8734_5000_test" }),
      makeEvent("page_visit", {
        ref: "https://goodlabgroup.com/lander/chronic-kidney-disease?aff_id=8836_0001",
      }),
      makeEvent("lead_accepted", { affId: "8734_5000_test", price: "30.00" }),
    ];
    const stats = aggregateStats(events);
    const byAff = Object.fromEntries(stats.affBreakdown.map((r) => [r.affId, r]));
    expect(byAff["8734_5000_test"].visits).toBe(1);
    expect(byAff["8734_5000_test"].accepted).toBe(1);
    expect(byAff["8734_5000_test"].revenue).toBe(30);
    expect(byAff["8836_0001"].visits).toBe(1);
  });

  it("resolveAffId falls back to direct when missing", () => {
    expect(resolveAffId(makeEvent("page_visit"))).toBe("(direct / unknown)");
    expect(resolveAffId(makeEvent("page_visit", { affId: "test" }))).toBe("test");
  });
});
