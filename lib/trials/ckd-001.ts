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
    "Adults aged 18-65 who have kidney disease may qualify for this study. Pre-qualifying takes about a minute.",

  compensation: "",

  benefits: [
    { text: "Compensation for time and travel" },
    { text: "Study-related care at no cost to you" },
    { text: "Access to board-certified nephrologists" },
    { text: "Health insurance not required" },
  ],

  stats: [
    { label: "Age range", value: "18–65", sub: "Adults of any sex" },
    { label: "Duration", value: "8–24", unit: "wks", sub: "Trial length" },
  ],

  studyHeadline: "An investigational treatment for APOL-1 mediated kidney disease.",

  studyDescription: [
    "This study is investigating an investigational treatment for chronic kidney disease caused by genetic factors that primarily affect people of African descent, specifically focusing on APOL-1 mediated kidney disease.",
    "The study aims to evaluate the safety and effectiveness of the investigational medication in slowing the progression of kidney disease in eligible participants. Participants will be randomly chosen to receive either the investigational medication or a placebo. About 2 out of 3 participants will receive the study drug. After this part of the study, everyone will have the chance to receive the study drug in a later phase, as long as early results show it's safe and helpful.",
    "Should you express interest, the research site will contact you directly to provide further details and address any questions you may have about study requirements, risks/benefits, and compensation.",
  ],

  criteria: [
    { label: "Who can join", value: "Adults aged 18 to 65 of any sex with kidney disease." },
    { label: "Kidney function", value: "Estimated glomerular filtration rate (eGFR) between 30 and 89." },
    { label: "Not eligible if", value: "Currently receiving dialysis, or kidney transplant within the past 12 months." },
    { label: "Time commitment", value: "Typically 8 to 24 weeks, depending on your participation." },
  ],

  ctaHeadline: "See if you qualify for this kidney disease study.",
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
      title: "Compensation for time and travel.",
      description:
        "Qualified participants receive compensation for time and travel — paid for completed visits and reimbursed for related travel expenses.",
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
