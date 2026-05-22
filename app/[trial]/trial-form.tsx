"use client";

import { useState } from "react";
import type { TrialQuestion, ContactField } from "@/lib/trials/types";

type Props = {
  trialId: string;
  questions: TrialQuestion[];
  contactFields: ContactField[];
};

export default function TrialForm({ trialId, questions }: Props) {
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

  return (
    <div className="form-card">
      {/* Header */}
      <div className="form-head">
        <h3>Check eligibility</h3>
        <span className="step-frac">
          {done ? "DONE" : `${pad(step + 1)} / ${pad(totalSteps)}`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="progress-line">
        <div className="fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Success state */}
      {done && (
        <div className="success-state">
          <div className="check">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M5 12.5 L10 17.5 L19 7.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3>You may be eligible.</h3>
          <p>A study coordinator will reach out within 1–2 business days.</p>
        </div>
      )}

      {/* Question steps */}
      {currentQ && !done && (
        <div>
          <p className="q-label">{currentQ.question}</p>

          {currentQ.type === "height" && (
            <div className="input-row">
              <input
                className="inp"
                placeholder="Feet"
                inputMode="numeric"
                value={values[currentQ.id + "_feet"] ?? ""}
                onChange={(e) => setValue(currentQ.id + "_feet", e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && isReady()) advance(); }}
              />
              <input
                className="inp"
                placeholder="Inches"
                inputMode="numeric"
                value={values[currentQ.id + "_inches"] ?? ""}
                onChange={(e) => setValue(currentQ.id + "_inches", e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && isReady()) advance(); }}
              />
            </div>
          )}

          {currentQ.type === "weight" && (
            <div className="input-row col">
              <input
                className="inp"
                placeholder="e.g. 175"
                inputMode="numeric"
                value={values[currentQ.id] ?? ""}
                onChange={(e) => setValue(currentQ.id, e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && isReady()) advance(); }}
              />
            </div>
          )}

          {currentQ.type === "text" && (
            <div className="input-row col">
              <input
                className="inp"
                placeholder="Type here..."
                value={values[currentQ.id] ?? ""}
                onChange={(e) => setValue(currentQ.id, e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && isReady()) advance(); }}
              />
            </div>
          )}

          {(currentQ.type === "boolean" || currentQ.type === "select") && (
            <div className="radio-group">
              {(currentQ.type === "boolean" ? ["Yes", "No"] : currentQ.options ?? []).map((opt) => (
                <label
                  key={opt}
                  className={`radio-opt ${values[currentQ.id] === opt ? "sel" : ""}`}
                  onClick={() => handleRadioSelect(opt)}
                >
                  <span className="dot"></span>
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          )}

          {/* Actions */}
          {(currentQ.type === "height" || currentQ.type === "weight" || currentQ.type === "text") && (
            <div className="form-actions">
              {step > 0 ? (
                <button type="button" className="btn-back" onClick={back}>← Back</button>
              ) : <span />}
              <button
                type="button"
                className={`btn-cont ${isReady() ? "ready" : ""}`}
                onClick={advance}
              >
                {step === totalSteps - 1 ? "Submit" : "Continue"} <span style={{ opacity: 0.8 }}>→</span>
              </button>
            </div>
          )}

          {(currentQ.type === "boolean" || currentQ.type === "select") && step > 0 && (
            <div className="form-actions">
              <button type="button" className="btn-back" onClick={back}>← Back</button>
              <span />
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      {!done && (
        <p className="form-foot">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="3" y="6" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M5 6 V4 C5 2.9 5.9 2 7 2 C8.1 2 9 2.9 9 4 V6" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
          HIPAA compliant. Your answers stay private.
        </p>
      )}
    </div>
  );
}
