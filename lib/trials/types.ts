export type QuestionType = "boolean" | "select" | "height" | "weight" | "text";

export type TrialQuestion = {
  id: string;
  question: string;
  type: QuestionType;
  options?: string[];
  required: boolean;
};

export type ContactField =
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "dob"
  | "sex"
  | "address"
  | "zipCode"
  | "ethnicity";

export type Benefit = {
  text: string;
  bold?: string;
};

export type Stat = {
  label: string;
  value: string;
  unit?: string;
  sub: string;
};

export type CriteriaRow = {
  label: string;
  value: string;
};

export type WhyReason = {
  title: string;
  description: string;
};

export type TrustItem = {
  label: string;
};

export type CompanyInfo = {
  name: string;
  tagline: string;
  description: string;
  meta: { label: string; value: string }[];
};

export type TrialConfig = {
  trialId: string;
  studyCode: string;
  title: string;
  subtitle: string;
  slug: string;
  condition: string;
  partner: string;
  heroDescription: string;
  compensation: string;
  benefits: Benefit[];
  stats: Stat[];
  studyHeadline: string;
  studyDescription: string[];
  criteria: CriteriaRow[];
  ctaHeadline: string;
  ctaDescription: string;
  ctaStat?: { value: string; label: string };
  whyHeadline: string;
  whyReasons: WhyReason[];
  trustItems: TrustItem[];
  company: CompanyInfo;
  routing: {
    destination: string;
    requiresRelay: boolean;
  };
  questions: TrialQuestion[];
  contactFields: ContactField[];
  consent: Record<string, boolean>;
};
