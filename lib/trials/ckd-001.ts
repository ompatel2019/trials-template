import type { TrialConfig } from "./types";

export const ckd001: TrialConfig = {
  trialId: "ckd-001",
  studyCode: "NB-2614",
  title: "Research study for adults with CKD.",
  subtitle: "Chronic Kidney Disease",
  slug: "chronic-kidney-disease",
  condition: "CKD",
  partner: "HealthMatch",

  leadspediaTrialCode: "ckd14",
  healthmatchTrialId: "AZCKDD6800C00005",
  healthmatchConditionId: "400",

  heroDescription:
    "Northbrook is enrolling adults aged 22–75 with moderate kidney function decline to evaluate an investigational oral therapy. Pre-qualifying takes about a minute.",

  compensation: "$2,800",

  benefits: [
    { text: "compensation, plus travel", bold: "Up to $2,800" },
    { text: "Study-related care at no cost to you" },
    { text: "Access to board-certified nephrologists" },
    { text: "Health insurance not required" },
  ],

  stats: [
    { label: "Age range", value: "22–75", sub: "Adults of any sex" },
    { label: "Duration", value: "26", unit: "wks", sub: "From screening to follow-up" },
    { label: "Visits", value: "6", unit: "+2 remote", sub: "On-site clinical visits" },
    { label: "Compensation", value: "$2,800", sub: "Plus travel reimbursement" },
  ],

  studyHeadline: "An investigational therapy for moderate kidney function decline.",

  studyDescription: [
    "The purpose of this study is to evaluate the safety and effectiveness of an investigational oral medication in adults diagnosed with chronic kidney disease (CKD) stages 2–4. Participants are monitored over 26 weeks with regular bloodwork, eGFR tracking, and clinical assessments.",
    "This study is conducted under the oversight of an independent Institutional Review Board / Ethics Committee, which exists to ensure the rights, safety, and well-being of every participant.",
  ],

  criteria: [
    { label: "Who can join", value: "Adults aged 22 to 75 of any sex, diagnosed with CKD stages 2–4." },
    { label: "Kidney function", value: "Estimated glomerular filtration rate (eGFR) between 30 and 89." },
    { label: "Not eligible if", value: "Currently receiving dialysis, or kidney transplant within the past 12 months." },
    { label: "Time commitment", value: "Six on-site visits and two remote check-ins across 26 weeks." },
  ],

  ctaHeadline: "You could be paid up to $2,800 to take part in this study.",
  ctaDescription:
    "Pre-qualifying takes about a minute, and there's never a cost to participate — health insurance isn't required.",
  ctaStat: { value: "1,420+", label: "people enrolled this year" },

  whyHeadline: "Four reasons people choose to participate.",
  whyReasons: [
    {
      title: "Care from kidney specialists.",
      description:
        "Every visit includes time with board-certified nephrologists and research clinicians who focus specifically on chronic kidney disease.",
    },
    {
      title: "Access to investigational therapy.",
      description:
        "Participants may receive a treatment under study before it's available to the public, while contributing to the evidence that gets new medicine approved.",
    },
    {
      title: "Compensation for your time.",
      description:
        "Qualified participants are paid for completed visits and reimbursed for related travel expenses — this isn't volunteer work.",
    },
    {
      title: "No insurance, no cost.",
      description:
        "All study-related care is provided at no cost to you, and health insurance isn't required to enroll or stay enrolled.",
    },
  ],

  trustItems: [
    { label: "HIPAA Compliant" },
    { label: "IRB Approved Protocol" },
    { label: "34 Research Sites · 21 States" },
    { label: "~60 Seconds to Pre-qualify" },
  ],

  company: {
    name: "Good Lab",
    tagline: "Clinical Trials.",
    description:
      "Good Lab is a free clinical trial matchmaking service. We partner with a broad range of clinical trial providers across the US to deliver access to cutting-edge treatments & new medications unavailable elsewhere — entirely free of charge. We do the work of matching: connecting people who want to be considered for a study with the sites that are actively looking for participants. There's no cost to you, ever, and insurance isn't required to take part.",
    meta: [
      { label: "Founded", value: "2018" },
      { label: "Headquarters", value: "Boston, MA" },
      { label: "Active sites", value: "34 in 21 states" },
      { label: "Total enrolled", value: "14,200+" },
    ],
  },

  routing: {
    destination: "healthmatch",
    requiresRelay: true,
  },

  questions: [
    { id: "height", question: "What is your height?", type: "height", required: true },
    { id: "weight", question: "What is your weight, in pounds?", type: "weight", required: true },
    {
      id: "ckd_diagnosis",
      question: "Have you been diagnosed with chronic kidney disease?",
      type: "select",
      options: ["Yes, currently", "Yes, in the past", "No", "I'm not sure"],
      required: true,
      disqualifyIf: ["No"],
    },
    {
      id: "dialysis",
      question: "Are you currently receiving dialysis?",
      type: "select",
      options: ["No", "Yes", "Previously, but not now"],
      required: true,
      disqualifyIf: ["Yes"],
    },
    {
      id: "kidney_transplant",
      question: "Have you had a kidney transplant?",
      type: "boolean",
      required: true,
      disqualifyIf: ["Yes"],
    },
    {
      id: "diabetes",
      question: "Do you have diabetes?",
      type: "select",
      options: ["No", "Type 2 diabetes", "Type 1 diabetes"],
      required: true,
      disqualifyIf: ["Type 1 diabetes"],
    },
    {
      id: "insulin_use",
      question: "Have you ever taken insulin medications?",
      type: "boolean",
      required: true,
    },
    {
      id: "excluded_conditions",
      question: "Have you been diagnosed with any of the following conditions?",
      type: "multiselect",
      options: [
        "Hepatitis B (active)",
        "Hepatitis C (active)",
        "Sickle cell disease",
        "Liver disease / failure / cirrhosis",
        "Long QT syndrome",
        "Bleeding disorder",
        "Cancer diagnosed/treated within past 5 years",
        "None of the above",
      ],
      required: true,
      disqualifyIfAny: [
        "Hepatitis B (active)",
        "Hepatitis C (active)",
        "Sickle cell disease",
        "Liver disease / failure / cirrhosis",
        "Long QT syndrome",
        "Bleeding disorder",
        "Cancer diagnosed/treated within past 5 years",
      ],
    },
    {
      id: "recent_events",
      question: "Have any of these occurred in the past 6 months?",
      type: "multiselect",
      options: [
        "Stroke in the past 3 months",
        "Heart attack in the past 6 months",
        "Coronary revascularization in past 6 months",
        "Organ transplant",
        "None of the above",
      ],
      required: true,
      disqualifyIfAny: [
        "Stroke in the past 3 months",
        "Heart attack in the past 6 months",
        "Coronary revascularization in past 6 months",
        "Organ transplant",
      ],
    },
    {
      id: "clinical_trial",
      question: "Are you currently participating in another clinical trial?",
      type: "boolean",
      required: true,
      disqualifyIf: ["Yes"],
    },
    {
      id: "african_ancestry",
      question: "Do you have African ancestry?",
      type: "boolean",
      required: true,
    },
  ],

  contactFields: [
    "firstName",
    "lastName",
    "email",
    "phone",
    "zipCode",
    "address",
    "dob",
    "sex",
    "ethnicity",
    "doctorDetails",
  ],

  consent: {
    requiresHealthMatchConsent: true,
    requiresEMRConsent: true,
    requiresSiteConsent: true,
  },
};
