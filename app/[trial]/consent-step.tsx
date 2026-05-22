"use client";

import { useState } from "react";

type Props = {
  siteConsentText: string;
  sitePreamble: string;
  onConsentsComplete: (consents: ConsentValues) => void;
  onBack: () => void;
  compact?: boolean;
};

export type ConsentValues = {
  healthmatchTerms: boolean;
  emrConsent: boolean;
  siteConsent: boolean;
};

const HM_TERMS_TEXT = `I agree to HealthMatch's Terms of Service and Privacy Policy. I understand that my information is being collected by Good Lab on behalf of HealthMatch and will be stored on the HealthMatch platform and used in accordance with HealthMatch's Privacy Policy for the purpose of assessing my eligibility for clinical trials.`;

const EMR_CONSENT_TEXT = `I authorize HealthMatch to collect my medical records for eligibility determination.

Authorization to release protected health information

I authorize HealthMatch, and any covered entities or vendors working on behalf of HealthMatch, to obtain copies of all my medical records and information pertaining to my medical care and history, and payment or billing for such medical care, for all dates of service from any and all of my (i) health care providers that have treated me; and (ii) health plans that have paid for health care services on my behalf. This includes medical records and information concerning HIV testing or treatment of AIDS, sexually transmitted and other communicable diseases, substance use disorders, mental health/psychiatric records, developmental disability records, and genetic information.

I request that this information be released to HealthMatch for the purpose of assisting me determine my eligibility for clinical trials and providing my information to relevant clinical trial providers.

HealthMatch is a healthcare technology company and not a healthcare provider. HealthMatch does not offer medical advice, diagnosis, treatment or any form of medical opinion or recommendation through its services or otherwise. By my acceptance of this Authorization, I hereby request, consent, and authorize HealthMatch to coordinate access to a healthcare provider who may be able to provide a clinical assessment related to its services. I understand that while HealthMatch facilitates such access to a healthcare provider on my behalf, I am free to choose any healthcare provider and to continue using HealthMatch services.

I understand that I have the right to revoke this Authorization in writing, at any time, by sending a written request to HealthMatch, which shall be considered effective upon receipt. I understand that a revocation is not effective to the extent that any person or entity has already acted in reliance on my Authorization. I understand that I am not required to sign this Authorization and that my provider or health plan cannot condition treatment, payment, enrollment or eligibility for benefits on my execution of this Authorization. I have the right to receive a copy of this Authorization. I understand that once my information is disclosed pursuant to this Authorization, it may be re-disclosed by the recipient listed above and, in that case, may no longer be protected by HIPAA. This Authorization remains in effect for one (1) year, unless I revoke the Authorization at an earlier date.`;

export default function ConsentStep({ siteConsentText, sitePreamble, onConsentsComplete, onBack, compact }: Props) {
  const [consents, setConsents] = useState<ConsentValues>({
    healthmatchTerms: false,
    emrConsent: false,
    siteConsent: false,
  });
  const [emrExpanded, setEmrExpanded] = useState(false);

  const allAccepted = consents.healthmatchTerms && consents.emrConsent && consents.siteConsent;

  function toggle(key: keyof ConsentValues) {
    setConsents((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const checkboxCls = (checked: boolean) =>
    `w-5 h-5 rounded border-[1.5px] shrink-0 flex items-center justify-center cursor-pointer transition-all duration-150 ${
      checked
        ? "bg-[var(--blue)] border-[var(--blue)]"
        : "bg-white border-[var(--rule)] hover:border-[var(--blue)]"
    }`;

  const btnCls = (ready: boolean) =>
    `flex-1 ${compact ? "py-3.5 px-[18px] text-[14px]" : "py-[15px] px-[22px] text-[14.5px]"} bg-[var(--orange)] text-white border-0 rounded-lg font-semibold cursor-pointer inline-flex items-center justify-center gap-2 transition-[opacity,background] duration-150 ${
      ready ? "opacity-100 pointer-events-auto hover:bg-[var(--orange-2)]" : "opacity-40 pointer-events-none"
    }`;

  const backBtnCls =
    "bg-transparent border-0 text-[var(--ink-3)] text-[13.5px] font-medium cursor-pointer py-2 px-3 rounded-md hover:text-[var(--ink)] hover:bg-[var(--bg-tint)] transition-colors duration-200";

  return (
    <div>
      <div className="text-center mb-5">
        <p className={`font-bold text-[var(--ink)] m-0 mb-1.5 leading-[1.25] tracking-[-0.01em] ${compact ? "text-[17px]" : "text-[19px]"}`}>
          Review &amp; consent
        </p>
        <p className="text-[13.5px] text-[var(--ink-2)] m-0">
          Please review and accept the following to proceed:
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* HealthMatch Terms */}
        <label className="flex gap-3 items-start cursor-pointer p-3 border border-[var(--rule)] rounded-lg hover:border-[var(--blue)] transition-colors" onClick={() => toggle("healthmatchTerms")}>
          <span className={checkboxCls(consents.healthmatchTerms)}>
            {consents.healthmatchTerms && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </span>
          <span className="text-[13px] leading-[1.5] text-[var(--ink-2)]">
            {HM_TERMS_TEXT}
          </span>
        </label>

        {/* EMR Consent */}
        <div className="border border-[var(--rule)] rounded-lg p-3">
          <label className="flex gap-3 items-start cursor-pointer" onClick={() => toggle("emrConsent")}>
            <span className={checkboxCls(consents.emrConsent)}>
              {consents.emrConsent && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </span>
            <span className="text-[13px] leading-[1.5] text-[var(--ink-2)]">
              I authorize HealthMatch to collect my medical records for eligibility determination.
            </span>
          </label>
          <button
            type="button"
            className="text-[11px] text-[var(--blue)] mt-2 ml-8 bg-transparent border-0 cursor-pointer underline"
            onClick={(e) => { e.stopPropagation(); setEmrExpanded(!emrExpanded); }}
          >
            {emrExpanded ? "Hide full authorization" : "Read full authorization"}
          </button>
          {emrExpanded && (
            <div className="mt-3 ml-8 p-3 bg-[var(--bg-tint)] rounded text-[11px] leading-[1.6] text-[var(--ink-3)] max-h-[200px] overflow-y-auto whitespace-pre-wrap">
              {EMR_CONSENT_TEXT}
            </div>
          )}
        </div>

        {/* Site-specific Consent */}
        <label className="flex gap-3 items-start cursor-pointer p-3 border border-[var(--rule)] rounded-lg hover:border-[var(--blue)] transition-colors" onClick={() => toggle("siteConsent")}>
          <span className={checkboxCls(consents.siteConsent)}>
            {consents.siteConsent && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </span>
          <div className="text-[13px] leading-[1.5] text-[var(--ink-2)]">
            {sitePreamble && <strong className="block mb-1 text-[var(--ink)]">{sitePreamble}</strong>}
            {siteConsentText || "Loading site consent..."}
          </div>
        </label>
      </div>

      <div className="flex items-center justify-between gap-3 mt-6">
        <button type="button" className={backBtnCls} onClick={onBack}>
          ← Back
        </button>
        <button
          type="button"
          className={btnCls(allAccepted)}
          onClick={() => allAccepted && onConsentsComplete(consents)}
        >
          Submit <span style={{ opacity: 0.8 }}>→</span>
        </button>
      </div>
    </div>
  );
}
