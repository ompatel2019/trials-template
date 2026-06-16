"use client";

import { useState, useTransition } from "react";
import type { AggregatedStats } from "@/lib/analytics";
import { useRouter, usePathname } from "next/navigation";

type Props = {
  trial: string;
  stats: AggregatedStats;
  rangeLabel: string;
  currentRange: string;
};

const PIN = "9021";

export default function AnalyticsDashboard({ trial, stats, rangeLabel, currentRange }: Props) {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  function checkPin() {
    if (pin === PIN) {
      setUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  }

  function setRange(range: string) {
    const param = range === "all" ? "" : `?range=${range}`;
    startTransition(() => {
      router.push(`${pathname}${param}`);
    });
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-8 w-full max-w-[340px]">
          <h1 className="text-[22px] font-bold text-[#1a1a2e] m-0 mb-1 tracking-[-0.02em]">Analytics</h1>
          <p className="text-[14px] text-[#6b7280] m-0 mb-6">Enter PIN to continue</p>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setPin(val);
              setPinError(false);
              if (val === PIN) { setUnlocked(true); }
            }}
            onKeyDown={(e) => e.key === "Enter" && checkPin()}
            placeholder="••••"
            className={`w-full text-center text-[28px] tracking-[0.3em] py-3 border rounded-lg outline-none transition-colors ${
              pinError ? "border-red-400 bg-red-50" : "border-[#e5e7eb] focus:border-[#3b82f6]"
            }`}
            autoFocus
          />
          {pinError && <p className="text-red-500 text-[13px] mt-2 m-0">Incorrect PIN</p>}
          <button
            onClick={checkPin}
            className="w-full mt-4 py-3 bg-[#1a1a2e] text-white rounded-lg font-semibold text-[14px] border-0 cursor-pointer hover:bg-[#2d2d44] transition-colors"
          >
            Unlock
          </button>
        </div>
      </div>
    );
  }

  const ranges = [
    { key: "today", label: "Today" },
    { key: "7d", label: "7 days" },
    { key: "30d", label: "30 days" },
    { key: "all", label: "All time" },
  ];

  const summaryCards = [
    { label: "Visits", value: stats.visits },
    { label: "Form Starts", value: stats.formStarts },
    { label: "Submitted", value: stats.leadsSubmitted },
    { label: "Accepted", value: stats.leadsAccepted },
    { label: "Conversion", value: `${stats.conversionRate}%` },
  ];

  const dqTotal = stats.screeningDisqualified + stats.zipRejected + stats.leadsFailed;
  const funnelDqBreakdown = [
    { label: "Screening DQ", count: stats.screeningDisqualified },
    { label: "ZIP Rejected", count: stats.zipRejected },
  ].filter((d) => d.count > 0);

  const maxFunnel = Math.max(...stats.funnel.map((f) => f.count), 1);

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* Header */}
      <div className="bg-white border-b border-[#e5e7eb]">
        <div className="max-w-[1100px] mx-auto px-6 py-5 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-[22px] font-bold text-[#1a1a2e] m-0 tracking-[-0.02em]">
              Analytics
              <span className="text-[14px] font-normal text-[#6b7280] ml-2">/{trial}</span>
            </h1>
            <p className="text-[13px] text-[#9ca3af] m-0 mt-0.5">{rangeLabel}</p>
          </div>
          <div className="flex items-center gap-3">
            {isPending && (
              <svg className="animate-spin h-4 w-4 text-[#6366f1]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            <div className="flex gap-1.5 bg-[#f3f4f6] rounded-lg p-1">
              {ranges.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setRange(r.key)}
                  disabled={isPending}
                  className={`py-1.5 px-3 rounded-md text-[13px] font-medium border-0 cursor-pointer transition-all ${
                    currentRange === r.key
                      ? "bg-white text-[#1a1a2e] shadow-sm"
                      : "bg-transparent text-[#6b7280] hover:text-[#1a1a2e]"
                  } ${isPending ? "opacity-50 cursor-wait" : ""}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={`max-w-[1100px] mx-auto px-6 py-8 flex flex-col gap-8 transition-opacity duration-200 ${isPending ? "opacity-50" : ""}`}>
        {/* Summary Cards */}
        <div className="grid grid-cols-5 gap-4 max-lg:grid-cols-3 max-sm:grid-cols-2">
          {summaryCards.map((card) => (
            <div key={card.label} className="bg-white rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9ca3af] m-0 mb-2">{card.label}</p>
              <p className="text-[28px] font-bold text-[#1a1a2e] m-0 tracking-[-0.02em] leading-none">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[1fr_340px] gap-6 max-lg:grid-cols-1">
          {/* Funnel */}
          <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h2 className="text-[16px] font-bold text-[#1a1a2e] m-0 mb-5 tracking-[-0.01em]">Conversion Funnel</h2>
            <div className="flex flex-col gap-3">
              {stats.funnel.map((step, i) => (
                <div key={step.event} className="flex items-center gap-3">
                  <span className="text-[12px] text-[#6b7280] w-[130px] shrink-0 text-right">{step.label}</span>
                  <div className="flex-1 bg-[#f3f4f6] rounded-full h-[26px] relative overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max((step.count / maxFunnel) * 100, step.count > 0 ? 2 : 0)}%`,
                        backgroundColor: `hsl(${220 + i * 12}, 70%, ${50 + i * 3}%)`,
                      }}
                    />
                    <span className="absolute inset-0 flex items-center px-3 text-[12px] font-semibold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">
                      {step.count} <span className="text-white/70 ml-1 font-normal">({step.pct}%)</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rejection Breakdown */}
          <div className="bg-white rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <h2 className="text-[16px] font-bold text-[#1a1a2e] m-0 mb-5 tracking-[-0.01em]">Rejection Breakdown</h2>
            {dqTotal === 0 && stats.failureReasons.length === 0 ? (
              <p className="text-[14px] text-[#9ca3af] m-0">No rejections yet</p>
            ) : (
              <div className="flex flex-col gap-4">
                {funnelDqBreakdown.map((d) => (
                  <div key={d.label} className="flex items-center justify-between py-2 border-b border-[#f3f4f6] last:border-b-0">
                    <span className="text-[13px] font-medium text-[#374151]">{d.label}</span>
                    <span className="text-[13px] font-semibold text-[#ef4444]">{d.count}</span>
                  </div>
                ))}
                {stats.failureReasons.length > 0 && (
                  <>
                    {funnelDqBreakdown.length > 0 && <div className="border-t border-[#e5e7eb] my-1" />}
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9ca3af] m-0">Lead / Relay Failures</p>
                    {stats.failureReasons.map((fr) => (
                      <div key={fr.reason} className="flex items-center justify-between py-2 border-b border-[#f3f4f6] last:border-b-0">
                        <span className="text-[13px] text-[#374151]">{fr.reason}</span>
                        <span className="text-[13px] font-semibold text-[#ef4444]">{fr.count}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Daily Table */}
        <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#f3f4f6]">
            <h2 className="text-[16px] font-bold text-[#1a1a2e] m-0 tracking-[-0.01em]">Daily Breakdown</h2>
          </div>
          {stats.daily.length === 0 ? (
            <p className="text-[14px] text-[#9ca3af] m-0 p-6">No data yet</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#f3f4f6]">
                  {["Date", "Visits", "Form Starts", "Submitted", "Accepted", "Conv."].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9ca3af] py-3 px-4 first:pl-6 last:pr-6">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.daily.map((row) => (
                  <tr key={row.date} className="border-b border-[#f9fafb] hover:bg-[#f9fafb] transition-colors">
                    <td className="py-3 px-4 pl-6 text-[13px] font-medium text-[#374151]">{row.date}</td>
                    <td className="py-3 px-4 text-[13px] text-[#6b7280]">{row.visits}</td>
                    <td className="py-3 px-4 text-[13px] text-[#6b7280]">{row.formStarts}</td>
                    <td className="py-3 px-4 text-[13px] text-[#6b7280]">{row.submitted}</td>
                    <td className="py-3 px-4 text-[13px] text-[#6b7280] font-medium">{row.accepted}</td>
                    <td className="py-3 px-4 pr-6 text-[13px] text-[#6b7280]">{row.conversion}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Traffic by aff_id */}
        <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#f3f4f6]">
            <h2 className="text-[16px] font-bold text-[#1a1a2e] m-0 tracking-[-0.01em]">Traffic by Source (aff_id)</h2>
          </div>
          {stats.affBreakdown.length === 0 ? (
            <p className="text-[14px] text-[#9ca3af] m-0 p-6">No attribution data yet</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#f3f4f6]">
                  {["aff_id", "Visits", "Accepted", "Revenue", "Conv."].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9ca3af] py-3 px-4 first:pl-6 last:pr-6">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.affBreakdown.map((row) => (
                  <tr key={row.affId} className="border-b border-[#f9fafb] hover:bg-[#f9fafb] transition-colors">
                    <td className="py-3 px-4 pl-6 text-[13px] font-medium text-[#374151] max-w-[280px] truncate" title={row.affId}>
                      {row.affId}
                    </td>
                    <td className="py-3 px-4 text-[13px] text-[#6b7280]">{row.visits}</td>
                    <td className="py-3 px-4 text-[13px] text-[#6b7280] font-medium">{row.accepted}</td>
                    <td className="py-3 px-4 text-[13px] text-[#6b7280]">${row.revenue.toFixed(2)}</td>
                    <td className="py-3 px-4 pr-6 text-[13px] text-[#6b7280]">{row.conversion}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
