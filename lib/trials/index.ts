import type { TrialConfig } from "./types";
import { ckd001 } from "./ckd-001";

const trials: Record<string, TrialConfig> = {
  [ckd001.slug]: ckd001,
};

export function getTrialBySlug(slug: string): TrialConfig | null {
  return trials[slug] ?? null;
}

export type {
  TrialConfig,
  TrialQuestion,
  ContactField,
  Benefit,
  Stat,
  CriteriaRow,
  WhyReason,
  TrustItem,
  CompanyInfo,
} from "./types";
