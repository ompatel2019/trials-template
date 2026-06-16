import { readEvents, aggregateStats, sydneyDate } from "@/lib/analytics";
import AnalyticsDashboard from "./dashboard";

type Props = {
  params: Promise<{ trial: string }>;
  searchParams: Promise<{ range?: string }>;
};

function getDateRange(range?: string): { from?: string; to?: string; label: string } {
  const now = new Date();
  const to = sydneyDate(now);

  switch (range) {
    case "today":
      return { from: to, to, label: "Today" };
    case "7d": {
      const d = new Date(now);
      d.setDate(d.getDate() - 6);
      return { from: sydneyDate(d), to, label: "Last 7 days" };
    }
    case "30d": {
      const d = new Date(now);
      d.setDate(d.getDate() - 29);
      return { from: sydneyDate(d), to, label: "Last 30 days" };
    }
    default:
      return { label: "All time" };
  }
}

export default async function AnalyticsPage({ params, searchParams }: Props) {
  const { trial } = await params;
  const { range } = await searchParams;
  const { from, to, label } = getDateRange(range);
  const events = readEvents(from, to);
  const trialEvents = events.filter((e) => e.trial === trial || e.trial === "ckd14");
  const stats = aggregateStats(trialEvents);

  return <AnalyticsDashboard trial={trial} stats={stats} rangeLabel={label} currentRange={range || "all"} />;
}
