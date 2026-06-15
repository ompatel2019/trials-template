"use client";

import { useState } from "react";
import type { TrialQuestion, ContactField } from "@/lib/trials/types";
import { ELIGIBLE_ZIPS_CKD14 } from "@/lib/data/eligible-zips-ckd14";
import ConsentStep, { type ConsentValues } from "./consent-step";
import AddressAutocomplete from "./address-autocomplete";

type Props = {
  trialId: string;
  trialCode: string;
  questions: TrialQuestion[];
  contactFields: ContactField[];
  healthmatchTrialId?: string;
  compact?: boolean;
};

type FieldMeta = {
  label: string;
  type: "text" | "email" | "tel" | "select" | "ethnicity" | "doctorDetails";
  placeholder?: string;
  inputMode?: "text" | "numeric" | "email" | "tel";
  options?: string[];
};

const ETHNICITY_OPTIONS = [
  "Hispanic or Latino",
  "American Indian or Alaska Native",
  "Asian",
  "Black or African American",
  "Native Hawaiian or Other Pacific Islander",
  "White",
  "Other",
  "I'd prefer not to answer",
];

const FIELD_META: Record<ContactField, FieldMeta> = {
  firstName: { label: "First Name", type: "text", placeholder: "First Name" },
  lastName: { label: "Last Name", type: "text", placeholder: "Last Name" },
  email: { label: "Email", type: "email", placeholder: "Email", inputMode: "email" },
  phone: { label: "Phone", type: "tel", placeholder: "Phone (must be 10 digits)", inputMode: "tel" },
  dob: { label: "Date of Birth", type: "text", placeholder: "mm/dd/yyyy", inputMode: "numeric" },
  sex: { label: "Gender", type: "select", options: ["Female", "Male"] },
  address: { label: "Address", type: "text", placeholder: "Start typing your address..." },
  zipCode: { label: "Zip Code", type: "text", placeholder: "Zip Code", inputMode: "numeric" },
  ethnicity: { label: "Ethnicity", type: "ethnicity" },
  doctorDetails: {
    label: "Doctor Details",
    type: "doctorDetails",
    placeholder: "e.g. Alex Santos at Atlanta Nephrology Clinic",
  },
};

const PART_1_LAYOUT: ContactField[][] = [
  ["firstName", "lastName"],
  ["email"],
  ["phone"],
  ["zipCode"],
];

const PART_2A_LAYOUT: ContactField[][] = [
  ["dob", "sex"],
  ["address"],
];

const PART_2B_LAYOUT: ContactField[][] = [
  ["ethnicity"],
  ["doctorDetails"],
];

type Phase = "screening" | "details_1" | "details_2a" | "details_2b" | "consent" | "submitting" | "success" | "rejected";

export default function TrialForm({ trialId, trialCode, questions, contactFields, healthmatchTrialId, compact }: Props) {
  const [phase, setPhase] = useState<Phase>("screening");
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [multiValues, setMultiValues] = useState<Record<string, string[]>>({});
  const [zipError, setZipError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [siteConsent, setSiteConsent] = useState({ preamble: "", consent: "" });
  const [selectedEthnicities, setSelectedEthnicities] = useState<string[]>([]);

  const totalScreening = questions.length;
  const contactSteps = 4; // details_1, details_2a, details_2b, consent

  function setValue(key: string, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  function toggleMultiValue(questionId: string, option: string) {
    setMultiValues((prev) => {
      const current = prev[questionId] || [];
      if (option === "None of the above") {
        return { ...prev, [questionId]: ["None of the above"] };
      }
      const withoutNone = current.filter((v) => v !== "None of the above");
      if (current.includes(option)) {
        return { ...prev, [questionId]: withoutNone.filter((v) => v !== option) };
      }
      return { ...prev, [questionId]: [...withoutNone, option] };
    });
  }

  function evaluateEligibility(vals: Record<string, string>, multiVals: Record<string, string[]>): boolean {
    return questions.every((q) => {
      if (q.type === "multiselect") {
        if (!q.disqualifyIfAny) return true;
        const selected = multiVals[q.id] || [];
        return !selected.some((s) => q.disqualifyIfAny!.includes(s));
      }
      if (!q.disqualifyIf) return true;
      const answer = vals[q.id];
      if (!answer) return true;
      return !q.disqualifyIf.includes(answer);
    });
  }

  function filterLayout(layout: ContactField[][]): ContactField[][] {
    return layout
      .map((row) => row.filter((f) => contactFields.includes(f)))
      .filter((row) => row.length > 0);
  }

  const part1Rows = filterLayout(PART_1_LAYOUT);
  const part2aRows = filterLayout(PART_2A_LAYOUT);
  const part2bRows = filterLayout(PART_2B_LAYOUT);
  const part1Fields = part1Rows.flat();
  const part2aFields = part2aRows.flat();
  const part2bFields = part2bRows.flat();

  function arePart1Valid(): boolean {
    return part1Fields.every((f) => {
      if (f === "address") return true;
      return !!values[f]?.trim();
    });
  }

  function arePart2aValid(): boolean {
    return part2aFields.every((f) => {
      if (f === "address") return true;
      return !!values[f]?.trim();
    });
  }

  function arePart2bValid(): boolean {
    return part2bFields.every((f) => {
      if (f === "ethnicity") return selectedEthnicities.length > 0;
      if (f === "doctorDetails") return true;
      return !!values[f]?.trim();
    });
  }

  const currentQ = phase === "screening" ? questions[step] : null;

  function isScreeningReady(): boolean {
    if (!currentQ) return false;
    if (currentQ.type === "height") {
      return !!(values[currentQ.id + "_feet"] && values[currentQ.id + "_inches"]);
    }
    if (currentQ.type === "multiselect") {
      return (multiValues[currentQ.id] || []).length > 0;
    }
    return !!values[currentQ.id];
  }

  function advanceScreening() {
    if (step < totalScreening - 1) {
      setStep(step + 1);
    } else {
      setPhase(evaluateEligibility(values, multiValues) ? "details_1" : "rejected");
    }
  }

  function backScreening() {
    if (step > 0) setStep(step - 1);
  }

  function handleRadioSelect(val: string) {
    if (!currentQ) return;
    const newValues = { ...values, [currentQ.id]: val };
    setValues(newValues);
    setTimeout(() => {
      if (step < totalScreening - 1) {
        setStep(step + 1);
      } else {
        setPhase(evaluateEligibility(newValues, multiValues) ? "details_1" : "rejected");
      }
    }, 300);
  }

  function submitPart1() {
    if (!arePart1Valid()) return;
    const zip = (values.zipCode || "").padStart(5, "0");
    if (!ELIGIBLE_ZIPS_CKD14.has(zip)) {
      setZipError("This trial isn't available in your area yet.");
      return;
    }
    setZipError("");
    fetchSiteConsent(zip);
    setPhase("details_2a");
  }

  async function fetchSiteConsent(zip: string) {
    if (!healthmatchTrialId) return;
    try {
      const res = await fetch("https://graphql-api.healthmatch.io/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operationName: "GetNearestTrialSite",
          variables: {
            trialId: healthmatchTrialId,
            countryCode: "US",
            postalCode: zip,
            localeCode: "EN",
          },
          query: `query GetNearestTrialSite($trialId: TrialID!, $countryCode: CountryCode!, $postalCode: String!, $localeCode: LocaleCode) {
            trial(id: $trialId) {
              closestTrialSite(criteria: {useNewPatientDetails: {countryCode: $countryCode, zipCode: $postalCode}, useLongDistanceMatching: false}) {
                consent(localeCode: $localeCode) {
                  preamble
                  consent
                }
              }
            }
          }`,
        }),
      });
      const json = await res.json();
      const consent = json?.data?.trial?.closestTrialSite?.consent;
      if (consent) {
        setSiteConsent({ preamble: consent.preamble, consent: consent.consent });
      }
    } catch {
      // Silently fail — consent will show generic text
    }
  }

  function submitPart2a() {
    if (arePart2aValid()) {
      setPhase("details_2b");
    }
  }

  function submitPart2b() {
    if (arePart2bValid()) {
      setPhase("consent");
    }
  }

  async function handleConsentsComplete(consents: ConsentValues) {
    if (!consents.healthmatchTerms || !consents.emrConsent || !consents.siteConsent) return;

    setPhase("submitting");
    setSubmitError("");

    const heightFeet = parseInt(values.height_feet || "0", 10);
    const heightInches = parseInt(values.height_inches || "0", 10);
    const heightCm = Math.round((heightFeet * 12 + heightInches) * 2.54);
    const weightLbs = parseFloat(values.weight || "0");
    const weightKg = Math.round(weightLbs * 0.453592 * 10) / 10;

    const screening = {
      heightCm,
      weightKg,
      hasCkd: values.ckd_diagnosis === "Yes, currently" || values.ckd_diagnosis === "Yes, in the past",
      diabetesType: values.diabetes === "Type 2 diabetes" ? "type2" : values.diabetes === "Type 1 diabetes" ? "type1" : "none",
      usesInsulin: values.insulin_use === "Yes",
      onDialysis: values.dialysis === "Yes",
      hadKidneyTransplant: values.kidney_transplant === "Yes",
      hasHepatitisB: (multiValues.excluded_conditions || []).includes("Hepatitis B (active)"),
      hasHepatitisC: (multiValues.excluded_conditions || []).includes("Hepatitis C (active)"),
      hasSickleCellDisease: (multiValues.excluded_conditions || []).includes("Sickle cell disease"),
      hasLiverDisease: (multiValues.excluded_conditions || []).includes("Liver disease / failure / cirrhosis"),
      hasLongQT: (multiValues.excluded_conditions || []).includes("Long QT syndrome"),
      hasBleedingDisorder: (multiValues.excluded_conditions || []).includes("Bleeding disorder"),
      hasCancerPast5Years: (multiValues.excluded_conditions || []).includes("Cancer diagnosed/treated within past 5 years"),
      hadStroke3Months: (multiValues.recent_events || []).includes("Stroke in the past 3 months"),
      hadHeartAttack6Months: (multiValues.recent_events || []).includes("Heart attack in the past 6 months"),
      hadCoronaryRevascularization: (multiValues.recent_events || []).includes("Coronary revascularization in past 6 months"),
      hadOrganTransplant: (multiValues.recent_events || []).includes("Organ transplant"),
      inClinicalTrial: values.clinical_trial === "Yes",
      hasAfricanAncestry: values.african_ancestry === "Yes",
      ethnicities: selectedEthnicities,
    };

    const sex = values.sex === "Male" ? "M" : "F";

    const payload = {
      trial: trialCode,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      zipCode: values.zipCode || "",
      dob: values.dob,
      sex,
      address: values.address || "",
      screening,
      consents,
      doctorDetails: values.doctorDetails || undefined,
      ethnicity: selectedEthnicities,
    };

    try {
      const res = await fetch("/lander/api/leadspedia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.result === "success") {
        setPhase("success");
      } else if (json.result === "failed") {
        setSubmitError(json.message || "We couldn't submit your referral. Please try again.");
        setPhase("consent");
      } else {
        setSubmitError(json.message || "Something went wrong. Please try again.");
        setPhase("consent");
      }
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
      setPhase("consent");
    }
  }

  function backFromPart1() {
    setPhase("screening");
    setStep(totalScreening - 1);
  }

  function backFromPart2a() {
    setPhase("details_1");
  }

  function backFromPart2b() {
    setPhase("details_2a");
  }

  function backFromConsent() {
    setPhase("details_2b");
  }

  // Progress: two separate bars — screening and contact form
  let progress = 0;
  if (phase === "screening") {
    progress = ((step + 1) / totalScreening) * 100;
  } else if (phase === "details_1") {
    progress = (1 / contactSteps) * 100;
  } else if (phase === "details_2a") {
    progress = (2 / contactSteps) * 100;
  } else if (phase === "details_2b") {
    progress = (3 / contactSteps) * 100;
  } else if (phase === "consent") {
    progress = (3.5 / contactSteps) * 100;
  } else {
    progress = 100;
  }

  const inputCls = compact
    ? "w-full py-[13px] px-3.5 bg-white border border-[var(--rule)] rounded-lg text-[var(--ink)] text-[14px] outline-none transition-[border-color,box-shadow] duration-[120ms] placeholder:text-[var(--ink-3)] focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_var(--blue-pale)]"
    : "w-full py-3.5 px-3.5 bg-white border border-[var(--rule)] rounded-lg text-[var(--ink)] text-[15px] outline-none transition-[border-color,box-shadow] duration-[120ms] placeholder:text-[var(--ink-3)] focus:border-[var(--blue)] focus:shadow-[0_0_0_3px_var(--blue-pale)]";

  const continueBtnCls = (ready: boolean) =>
    `flex-1 ${
      compact ? "py-3.5 px-[18px] text-[14px]" : "py-[15px] px-[22px] text-[14.5px]"
    } bg-[var(--orange)] text-white border-0 rounded-lg font-semibold cursor-pointer inline-flex items-center justify-center gap-2 transition-[opacity,background] duration-150 ${
      ready ? "opacity-100 pointer-events-auto hover:bg-[var(--orange-2)]" : "opacity-40 pointer-events-none"
    }`;

  const backBtnCls =
    "bg-transparent border-0 text-[var(--ink-3)] text-[13.5px] font-medium cursor-pointer py-2 px-3 rounded-md hover:text-[var(--ink)] hover:bg-[var(--bg-tint)] transition-colors duration-200";

  function renderField(field: ContactField) {
    const meta = FIELD_META[field];
    const filled = !!values[field];

    if (field === "address") {
      return (
        <div key={field}>
          <AddressAutocomplete
            value={values[field] || ""}
            onSelect={(address) => setValue("address", address)}
            className={inputCls}
            placeholder={meta.placeholder}
          />
          <p className="text-[11px] text-[var(--ink-3)] m-0 mt-1">Required for medical records lookup</p>
        </div>
      );
    }

    if (meta.type === "ethnicity") {
      return (
        <div key={field} className="flex flex-col gap-1.5">
          <p className="text-[13px] text-[var(--ink-2)] m-0 mb-1">Select all that apply:</p>
          {ETHNICITY_OPTIONS.map((opt) => {
            const checked = selectedEthnicities.includes(opt);
            return (
              <label
                key={opt}
                className={`flex items-center gap-2.5 py-2 px-3 border rounded-lg cursor-pointer transition-all duration-[120ms] text-[13px] ${
                  checked
                    ? "border-[var(--blue)] bg-[var(--blue-pale)]"
                    : "border-[var(--rule)] bg-white hover:border-[var(--blue)]"
                }`}
                onClick={() => {
                  setSelectedEthnicities((prev) =>
                    prev.includes(opt) ? prev.filter((e) => e !== opt) : [...prev, opt]
                  );
                }}
              >
                <span className={`w-4 h-4 rounded-[3px] border-[1.5px] shrink-0 flex items-center justify-center ${
                  checked ? "bg-[var(--blue)] border-[var(--blue)]" : "bg-white border-[var(--rule)]"
                }`}>
                  {checked && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                {opt}
              </label>
            );
          })}
        </div>
      );
    }

    if (meta.type === "doctorDetails") {
      return (
        <div key={field}>
          <p className="text-[13px] text-[var(--ink-2)] m-0 mb-1.5">
            What is the name and clinic of the doctor who manages your kidney disease?
          </p>
          <input
            className={inputCls}
            type="text"
            placeholder={meta.placeholder}
            value={values[field] ?? ""}
            onChange={(e) => setValue(field, e.target.value)}
          />
          <p className="text-[11px] text-[var(--ink-3)] m-0 mt-1">Optional — helps with medical records lookup</p>
        </div>
      );
    }

    if (meta.type === "select") {
      return (
        <div key={field} className="relative">
          <select
            className={`${inputCls} appearance-none pr-9 cursor-pointer ${
              filled ? "text-[var(--ink)]" : "text-[var(--ink-3)]"
            }`}
            value={values[field] ?? ""}
            onChange={(e) => setValue(field, e.target.value)}
          >
            <option value="" disabled>
              Select {meta.label}
            </option>
            {meta.options?.map((opt) => (
              <option key={opt} value={opt} className="text-[var(--ink)]">
                {opt}
              </option>
            ))}
          </select>
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4 text-[var(--ink-3)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      );
    }

    if (field === "dob") {
      return (
        <input
          key={field}
          className={inputCls}
          type="text"
          placeholder={meta.placeholder}
          inputMode="numeric"
          value={values[field] ?? ""}
          onKeyDown={(e) => {
            if (e.key === "Backspace") {
              e.preventDefault();
              const cur = values[field] ?? "";
              if (cur.length === 0) return;
              const trimmed = cur.endsWith("/") ? cur.slice(0, -2) : cur.slice(0, -1);
              setValue(field, trimmed);
            }
          }}
          onChange={(e) => {
            const prev = values[field] ?? "";
            const next = e.target.value;
            if (next.length < prev.length) return;
            const raw = next.replace(/\D/g, "").slice(0, 8);
            let formatted = raw;
            if (raw.length > 4) {
              formatted = `${raw.slice(0, 2)}/${raw.slice(2, 4)}/${raw.slice(4)}`;
            } else if (raw.length === 4) {
              formatted = `${raw.slice(0, 2)}/${raw.slice(2, 4)}/`;
            } else if (raw.length > 2) {
              formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`;
            } else if (raw.length === 2) {
              formatted = `${raw}/`;
            }
            setValue(field, formatted);
          }}
          maxLength={10}
        />
      );
    }

    return (
      <input
        key={field}
        className={inputCls}
        type={meta.type}
        placeholder={meta.placeholder}
        inputMode={meta.inputMode}
        value={values[field] ?? ""}
        onChange={(e) => setValue(field, e.target.value)}
      />
    );
  }

  function renderRow(row: ContactField[]) {
    if (row.length === 1) return <div key={row[0]}>{renderField(row[0])}</div>;
    return (
      <div key={row.join("-")} className="grid grid-cols-2 gap-2.5">
        {row.map(renderField)}
      </div>
    );
  }

  return (
    <div
      className={
        compact
          ? "bg-white rounded-[10px] pt-7 px-6 pb-6"
          : "bg-white rounded-[14px] border border-[var(--rule)] p-8 shadow-[0_30px_60px_-28px_rgba(13,46,111,.18),0_2px_0_rgba(13,46,111,.03)]"
      }
    >
      {/* Header */}
      {(phase === "screening" || phase === "details_1" || phase === "details_2a" || phase === "details_2b" || phase === "consent") && (
        <div className={`${compact ? "mb-4" : "mb-3.5"}`}>
          <h3 className={`font-bold m-0 tracking-[-0.01em] leading-[1.2] ${compact ? "text-[18px]" : "text-[22px]"}`}>
            {phase === "screening" ? "Check eligibility" : phase === "consent" ? "Consent" : "Your details"}
          </h3>
        </div>
      )}

      {/* Progress bar */}
      {phase !== "success" && phase !== "rejected" && phase !== "submitting" && (
        <div className={`h-1 bg-[var(--rule)] rounded-full relative overflow-hidden ${compact ? "mb-6" : "mb-[30px]"}`}>
          <div
            className="absolute inset-y-0 left-0 bg-[var(--blue)] rounded-full transition-[width] duration-[350ms] ease-[cubic-bezier(0.4,0.2,0.2,1)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Submitting state */}
      {phase === "submitting" && (
        <div className="pt-[18px] pb-2 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--blue-pale)] text-[var(--blue)] inline-flex items-center justify-center mb-[18px] animate-pulse">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2"/>
            </svg>
          </div>
          <h3 className="text-[20px] font-bold m-0 mb-2 tracking-[-0.01em]">Submitting...</h3>
          <p className="text-[var(--ink-2)] m-0 text-[14.5px]">Please wait while we process your application.</p>
        </div>
      )}

      {/* Success state */}
      {phase === "success" && (
        <div className="pt-[18px] pb-2 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--blue-pale)] text-[var(--blue)] inline-flex items-center justify-center mb-[18px]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M5 12.5 L10 17.5 L19 7.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-[22px] font-bold m-0 mb-2 tracking-[-0.01em]">Thanks — you&apos;re all set.</h3>
          <p className="text-[var(--ink-2)] m-0 text-[14.5px] leading-[1.6]">
            A study coordinator will reach out within 1–2 business days.
          </p>
        </div>
      )}

      {/* Rejected state */}
      {phase === "rejected" && (
        <div className="pt-[18px] pb-2 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-tint-2)] text-[var(--ink-2)] inline-flex items-center justify-center mb-[18px]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path d="M12 7v6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="12" cy="16.5" r="1" fill="currentColor" />
            </svg>
          </div>
          <h3 className="text-[20px] font-bold m-0 mb-2 tracking-[-0.01em]">Thanks for your interest.</h3>
          <p className="text-[var(--ink-2)] m-0 text-[14.5px] leading-[1.6] max-w-[300px] mx-auto">
            Based on your answers, this study isn&apos;t a match for you right now. We&apos;ll keep you in mind for future studies.
          </p>
        </div>
      )}

      {/* Screening question */}
      {phase === "screening" && currentQ && (
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
                onKeyDown={(e) => { if (e.key === "Enter" && isScreeningReady()) advanceScreening(); }}
              />
              <input
                className={inputCls}
                placeholder="Inches"
                inputMode="numeric"
                value={values[currentQ.id + "_inches"] ?? ""}
                onChange={(e) => setValue(currentQ.id + "_inches", e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && isScreeningReady()) advanceScreening(); }}
              />
            </div>
          )}

          {currentQ.type === "weight" && (
            <input
              className={inputCls}
              placeholder="e.g. 175"
              inputMode="numeric"
              value={values[currentQ.id] ?? ""}
              onChange={(e) => setValue(currentQ.id, e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && isScreeningReady()) advanceScreening(); }}
            />
          )}

          {currentQ.type === "text" && (
            <input
              className={inputCls}
              placeholder="Type here..."
              value={values[currentQ.id] ?? ""}
              onChange={(e) => setValue(currentQ.id, e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && isScreeningReady()) advanceScreening(); }}
            />
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
                    <span className={`w-4 h-4 rounded-full border-[1.5px] shrink-0 relative bg-white ${selected ? "border-[var(--blue)]" : "border-[var(--rule)]"}`}>
                      {selected && <span className="absolute inset-[3px] bg-[var(--blue)] rounded-full" />}
                    </span>
                    <span>{opt}</span>
                  </label>
                );
              })}
            </div>
          )}

          {currentQ.type === "multiselect" && (
            <div className="flex flex-col gap-2">
              {(currentQ.options ?? []).map((opt) => {
                const selected = (multiValues[currentQ.id] || []).includes(opt);
                return (
                  <label
                    key={opt}
                    className={`flex items-center gap-3 ${compact ? "py-3 px-3.5 text-[14px]" : "py-[13px] px-3.5 text-[15px]"} border rounded-lg cursor-pointer transition-all duration-[120ms] ${
                      selected
                        ? "border-[var(--blue)] bg-[var(--blue-pale)]"
                        : "border-[var(--rule)] bg-white hover:border-[var(--blue)] hover:bg-[#fafbfd]"
                    }`}
                    onClick={() => toggleMultiValue(currentQ.id, opt)}
                  >
                    <span className={`w-4 h-4 rounded-[3px] border-[1.5px] shrink-0 flex items-center justify-center ${
                      selected ? "bg-[var(--blue)] border-[var(--blue)]" : "bg-white border-[var(--rule)]"
                    }`}>
                      {selected && (
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    <span>{opt}</span>
                  </label>
                );
              })}
            </div>
          )}

          {(currentQ.type === "height" || currentQ.type === "weight" || currentQ.type === "text" || currentQ.type === "multiselect") && (
            <div className={`flex items-center justify-between gap-3 ${compact ? "mt-7" : "mt-6"}`}>
              {step > 0 ? (
                <button type="button" className={backBtnCls} onClick={backScreening}>← Back</button>
              ) : (
                <span />
              )}
              <button type="button" className={continueBtnCls(isScreeningReady())} onClick={advanceScreening}>
                Continue <span style={{ opacity: 0.8 }}>→</span>
              </button>
            </div>
          )}

          {(currentQ.type === "boolean" || currentQ.type === "select") && step > 0 && (
            <div className={`flex items-center justify-between gap-3 ${compact ? "mt-7" : "mt-6"}`}>
              <button type="button" className={backBtnCls} onClick={backScreening}>← Back</button>
              <span />
            </div>
          )}
        </div>
      )}

      {/* Details Part 1 */}
      {phase === "details_1" && (
        <div>
          <div className="text-center mb-5">
            <p className={`font-bold text-[var(--ink)] m-0 mb-1.5 leading-[1.25] tracking-[-0.01em] ${compact ? "text-[17px]" : "text-[19px]"}`}>
              Great news — you may qualify.
            </p>
            <p className="text-[13.5px] text-[var(--ink-2)] m-0">Please provide your details:</p>
          </div>
          <div className="flex flex-col gap-2.5">{part1Rows.map(renderRow)}</div>
          {zipError && (
            <p className="text-red-500 text-[13px] mt-2 m-0">{zipError}</p>
          )}
          <div className="flex items-center justify-between gap-3 mt-6">
            <button type="button" className={backBtnCls} onClick={backFromPart1}>← Back</button>
            <button type="button" className={continueBtnCls(arePart1Valid())} onClick={submitPart1}>
              Continue <span style={{ opacity: 0.8 }}>→</span>
            </button>
          </div>
        </div>
      )}

      {/* Details Part 2a — DOB, Gender, Address */}
      {phase === "details_2a" && (
        <div>
          <div className="text-center mb-5">
            <p className={`font-bold text-[var(--ink)] m-0 mb-1.5 leading-[1.25] tracking-[-0.01em] ${compact ? "text-[17px]" : "text-[19px]"}`}>
              Personal details
            </p>
            <p className="text-[13.5px] text-[var(--ink-2)] m-0">
              When is your date of birth, and where are you located?
            </p>
          </div>
          <div className="flex flex-col gap-2.5">{part2aRows.map(renderRow)}</div>
          <div className="flex items-center justify-between gap-3 mt-6">
            <button type="button" className={backBtnCls} onClick={backFromPart2a}>← Back</button>
            <button type="button" className={continueBtnCls(arePart2aValid())} onClick={submitPart2a}>
              Continue <span style={{ opacity: 0.8 }}>→</span>
            </button>
          </div>
        </div>
      )}

      {/* Details Part 2b — Ethnicity, Doctor */}
      {phase === "details_2b" && (
        <div>
          <div className="text-center mb-5">
            <p className={`font-bold text-[var(--ink)] m-0 mb-1.5 leading-[1.25] tracking-[-0.01em] ${compact ? "text-[17px]" : "text-[19px]"}`}>
              Background &amp; medical history
            </p>
            <p className="text-[13.5px] text-[var(--ink-2)] m-0">
              This helps us match you with the right research site:
            </p>
          </div>
          <div className="flex flex-col gap-2.5">{part2bRows.map(renderRow)}</div>
          <div className="flex items-center justify-between gap-3 mt-6">
            <button type="button" className={backBtnCls} onClick={backFromPart2b}>← Back</button>
            <button type="button" className={continueBtnCls(arePart2bValid())} onClick={submitPart2b}>
              Continue <span style={{ opacity: 0.8 }}>→</span>
            </button>
          </div>
        </div>
      )}

      {/* Consent Phase */}
      {phase === "consent" && (
        <>
          {submitError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-[13px] text-red-700">
              {submitError}
            </div>
          )}
          <ConsentStep
            siteConsentText={siteConsent.consent}
            sitePreamble={siteConsent.preamble}
            onConsentsComplete={handleConsentsComplete}
            onBack={backFromConsent}
            compact={compact}
          />
        </>
      )}

      {/* Footer */}
      {phase !== "success" && phase !== "rejected" && phase !== "submitting" && (
        <p className={`border-t border-[var(--rule-soft)] pt-3.5 flex items-center gap-2 text-[12px] text-[var(--ink-3)] ${compact ? "mt-[22px]" : "mt-[18px]"}`}>
          <svg className="shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="3" y="6" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.2" />
            <path d="M5 6 V4 C5 2.9 5.9 2 7 2 C8.1 2 9 2.9 9 4 V6" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          HIPAA compliant. Your answers stay private.
        </p>
      )}
    </div>
  );
}
