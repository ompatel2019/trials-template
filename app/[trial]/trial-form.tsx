"use client";

import { useState } from "react";
import type { TrialQuestion, ContactField } from "@/lib/trials/types";

type Props = {
  trialId: string;
  questions: TrialQuestion[];
  contactFields: ContactField[];
  compact?: boolean;
};

export default function TrialForm({ trialId, questions, compact }: Props) {
  const totalSteps = questions.length;
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const currentQ = !done ? questions[step] : null;
  const progress = done ? 100 : ((step) / totalSteps * 100 + 14);

  function setValue(key: string, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  function isReady(): boolean {
    if (!currentQ) return false;
    if (currentQ.type === "height") {
      return !!(values[currentQ.id + "_feet"] && values[currentQ.id + "_inches"]);
    }
    return !!(values[currentQ.id]);
  }

  function advance() {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      console.log("Form submission:", { trialId, values });
      setDone(true);
    }
  }

  function back() {
    if (step > 0) setStep(step - 1);
  }

  function handleRadioSelect(val: string) {
    if (!currentQ) return;
    setValue(currentQ.id, val);
    setTimeout(() => {
      setStep((s) => {
        if (s < totalSteps - 1) return s + 1;
        setDone(true);
        return s;
      });
    }, 300);
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  const inputCls = compact
    ? "w-full py-[13px] px-3.5 bg-white border border-[var(--rule)] rounded-lg text-[var(--ink)] text-[14px] outline-none transition-[border-color,box-shadow] duration-[120ms] placeholder:text-[var(--ink-3)] focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_var(--blue-pale)]"
    : "w-full py-3.5 px-3.5 bg-white border border-[var(--rule)] rounded-lg text-[var(--ink)] text-[15px] outline-none transition-[border-color,box-shadow] duration-[120ms] placeholder:text-[var(--ink-3)] focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_var(--blue-pale)]";

  return (
    <div className={
      compact
        ? "bg-white rounded-[10px] pt-7 px-6 pb-6"
        : "bg-white rounded-[14px] border border-[var(--rule)] p-8 shadow-[0_30px_60px_-28px_rgba(13,46,111,.18),0_2px_0_rgba(13,46,111,.03)]"
    }>
      {/* Header */}
      <div className={`flex items-baseline justify-between gap-2.5 ${compact ? "mb-4" : "mb-3.5"}`}>
        <h3 className={`font-bold m-0 tracking-[-0.01em] leading-[1.2] ${compact ? "text-[18px]" : "text-[22px]"}`}>
          Check eligibility
        </h3>
        <span className="font-mono text-[11px] text-[var(--ink-3)] tracking-[0.08em]">
          {done ? "DONE" : `${pad(step + 1)} / ${pad(totalSteps)}`}
        </span>
      </div>

      {/* Progress bar */}
      <div className={`h-1 bg-[var(--rule)] rounded-full relative overflow-hidden ${compact ? "mb-6" : "mb-[30px]"}`}>
        <div
          className="absolute inset-y-0 left-0 bg-[var(--blue)] rounded-full transition-[width] duration-[350ms] ease-[cubic-bezier(0.4,0.2,0.2,1)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Success state */}
      {done && (
        <div className="pt-[18px] pb-2 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--blue-pale)] text-[var(--blue)] inline-flex items-center justify-center mb-[18px]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M5 12.5 L10 17.5 L19 7.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-[24px] font-bold m-0 mb-2 tracking-[-0.01em]">You may be eligible.</h3>
          <p className="text-[var(--ink-2)] m-0 text-[15px]">A study coordinator will reach out within 1–2 business days.</p>
        </div>
      )}

      {/* Question steps */}
      {currentQ && !done && (
        <div>
          <p className={`font-semibold text-[var(--ink)] m-0 leading-[1.35] ${compact ? "text-[14.5px] mb-[18px]" : "text-[16px] mb-3.5"}`}>
            {currentQ.question}
          </p>

          {currentQ.type === "height" && (
            <div className="flex gap-2.5">
              <input
                className={inputCls}
                placeholder="Feet"
                inputMode="numeric"
                value={values[currentQ.id + "_feet"] ?? ""}
                onChange={(e) => setValue(currentQ.id + "_feet", e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && isReady()) advance(); }}
              />
              <input
                className={inputCls}
                placeholder="Inches"
                inputMode="numeric"
                value={values[currentQ.id + "_inches"] ?? ""}
                onChange={(e) => setValue(currentQ.id + "_inches", e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && isReady()) advance(); }}
              />
            </div>
          )}

          {currentQ.type === "weight" && (
            <div className="flex flex-col gap-2.5">
              <input
                className={inputCls}
                placeholder="e.g. 175"
                inputMode="numeric"
                value={values[currentQ.id] ?? ""}
                onChange={(e) => setValue(currentQ.id, e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && isReady()) advance(); }}
              />
            </div>
          )}

          {currentQ.type === "text" && (
            <div className="flex flex-col gap-2.5">
              <input
                className={inputCls}
                placeholder="Type here..."
                value={values[currentQ.id] ?? ""}
                onChange={(e) => setValue(currentQ.id, e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && isReady()) advance(); }}
              />
            </div>
          )}

          {(currentQ.type === "boolean" || currentQ.type === "select") && (
            <div className="flex flex-col gap-2">
              {(currentQ.type === "boolean" ? ["Yes", "No"] : currentQ.options ?? []).map((opt) => {
                const selected = values[currentQ.id] === opt;
                return (
                  <label
                    key={opt}
                    className={`flex items-center gap-3 ${compact ? "py-3 px-3.5 text-[14px]" : "py-[13px] px-3.5 text-[15px]"} border rounded-lg cursor-pointer transition-all duration-[120ms] ${
                      selected
                        ? "border-[var(--blue)] bg-[var(--blue-pale)]"
                        : "border-[var(--rule)] bg-white hover:border-[var(--blue)] hover:bg-[#fafbfd]"
                    }`}
                    onClick={() => handleRadioSelect(opt)}
                  >
                    <span className={`w-4 h-4 rounded-full border-[1.5px] shrink-0 relative bg-white ${
                      selected ? "border-[var(--blue)]" : "border-[var(--rule)]"
                    }`}>
                      {selected && (
                        <span className="absolute inset-[3px] bg-[var(--blue)] rounded-full" />
                      )}
                    </span>
                    <span>{opt}</span>
                  </label>
                );
              })}
            </div>
          )}

          {/* Actions */}
          {(currentQ.type === "height" || currentQ.type === "weight" || currentQ.type === "text") && (
            <div className={`flex items-center justify-between gap-3 ${compact ? "mt-7" : "mt-6"}`}>
              {step > 0 ? (
                <button
                  type="button"
                  className="bg-transparent border-0 text-[var(--ink-3)] text-[13.5px] font-medium cursor-pointer py-2 px-3 rounded-md hover:text-[var(--ink)] hover:bg-[var(--bg-tint)] transition-colors duration-200"
                  onClick={back}
                >
                  ← Back
                </button>
              ) : <span />}
              <button
                type="button"
                className={`flex-1 ${compact ? "py-3.5 px-[18px] text-[14px] w-full" : "py-[15px] px-[22px] text-[14.5px]"} bg-[var(--orange)] text-white border-0 rounded-lg font-semibold cursor-pointer inline-flex items-center justify-center gap-2 transition-[opacity,background] duration-150 ${
                  isReady()
                    ? "opacity-100 pointer-events-auto hover:bg-[var(--orange-2)]"
                    : "opacity-40 pointer-events-none"
                }`}
                onClick={advance}
              >
                {step === totalSteps - 1 ? "Submit" : "Continue"} <span style={{ opacity: 0.8 }}>→</span>
              </button>
            </div>
          )}

          {(currentQ.type === "boolean" || currentQ.type === "select") && step > 0 && (
            <div className={`flex items-center justify-between gap-3 ${compact ? "mt-7" : "mt-6"}`}>
              <button
                type="button"
                className="bg-transparent border-0 text-[var(--ink-3)] text-[13.5px] font-medium cursor-pointer py-2 px-3 rounded-md hover:text-[var(--ink)] hover:bg-[var(--bg-tint)] transition-colors duration-200"
                onClick={back}
              >
                ← Back
              </button>
              <span />
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      {!done && (
        <p className={`border-t border-[var(--rule-soft)] pt-3.5 flex items-center gap-2 text-[12px] text-[var(--ink-3)] ${compact ? "mt-[22px]" : "mt-[18px]"}`}>
          <svg className="shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="3" y="6" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M5 6 V4 C5 2.9 5.9 2 7 2 C8.1 2 9 2.9 9 4 V6" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
          HIPAA compliant. Your answers stay private.
        </p>
      )}
    </div>
  );
}
