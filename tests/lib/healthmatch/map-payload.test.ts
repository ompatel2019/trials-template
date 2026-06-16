import { describe, it, expect } from "vitest";
import {
  normalizeDobForHealthMatch,
  normalizePhoneForHealthMatch,
  mapToHealthMatchPayload,
  type ScreeningData,
  type LeadData,
} from "@/lib/healthmatch/map-payload";

// ─── normalizeDobForHealthMatch ───────────────────────────────────────────────

describe("normalizeDobForHealthMatch", () => {
  it("converts mm/dd/yyyy to YYYY-MM-DD", () => {
    expect(normalizeDobForHealthMatch("01/15/1990")).toBe("1990-01-15");
  });

  it("pads single-digit month and day", () => {
    expect(normalizeDobForHealthMatch("3/7/1985")).toBe("1985-03-07");
  });

  it("passes through an already-ISO date unchanged", () => {
    expect(normalizeDobForHealthMatch("1990-01-15")).toBe("1990-01-15");
  });

  it("trims surrounding whitespace", () => {
    expect(normalizeDobForHealthMatch("  01/15/1990  ")).toBe("1990-01-15");
  });
});

// ─── normalizePhoneForHealthMatch ─────────────────────────────────────────────

describe("normalizePhoneForHealthMatch", () => {
  it("converts a bare 10-digit number to E.164", () => {
    expect(normalizePhoneForHealthMatch("4045551234")).toBe("+14045551234");
  });

  it("strips formatting characters then converts", () => {
    expect(normalizePhoneForHealthMatch("(404) 555-1234")).toBe("+14045551234");
    expect(normalizePhoneForHealthMatch("404.555.1234")).toBe("+14045551234");
    expect(normalizePhoneForHealthMatch("404-555-1234")).toBe("+14045551234");
  });

  it("handles 11-digit number starting with 1", () => {
    expect(normalizePhoneForHealthMatch("14045551234")).toBe("+14045551234");
  });

  it("passes through a number already in E.164", () => {
    expect(normalizePhoneForHealthMatch("+14045551234")).toBe("+14045551234");
  });
});

// ─── mapToHealthMatchPayload ──────────────────────────────────────────────────

const baseLead: LeadData = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  phone: "4045551234",
  dob: "03/15/1975",
  sex: "F",
  address: "123 Main St, Atlanta, GA",
  zipCode: "30301",
};

const baseScreening: ScreeningData = {
  heightCm: 165,
  weightKg: 70,
  hasCkd: true,
  diabetesType: "none",
  usesInsulin: false,
  onDialysis: false,
  hadKidneyTransplant: false,
  hasHepatitisB: false,
  hasHepatitisC: false,
  hasSickleCellDisease: false,
  hasLiverDisease: false,
  hasLongQT: false,
  hasBleedingDisorder: false,
  hasCancerPast5Years: false,
  hadStroke3Months: false,
  hadHeartAttack6Months: false,
  hadCoronaryRevascularization: false,
  hadOrganTransplant: false,
  inClinicalTrial: false,
  hasAfricanAncestry: false,
  ethnicities: [],
};

describe("mapToHealthMatchPayload", () => {
  it("normalises DOB and phone in the output", () => {
    const payload = mapToHealthMatchPayload(baseLead, baseScreening, "site-1", 400);
    expect(payload.dob).toBe("1975-03-15");
    expect(payload.phoneNumber).toBe("+14045551234");
  });

  it("sets country to US and localeCode to EN", () => {
    const payload = mapToHealthMatchPayload(baseLead, baseScreening, "site-1", 400);
    expect(payload.country).toBe("US");
    expect(payload.localeCode).toBe("EN");
  });

  it("passes trialSiteId and conditionId through", () => {
    const payload = mapToHealthMatchPayload(baseLead, baseScreening, "site-xyz", 400);
    expect(payload.trialSiteId).toBe("site-xyz");
    expect(payload.condition).toBe(400);
  });

  it("sets attribution to affiliates / goodlab", () => {
    const payload = mapToHealthMatchPayload(baseLead, baseScreening, "site-1", 400);
    expect(payload.attribution).toEqual({ medium: "affiliates", source: "goodlab" });
  });

  it("includes CKD attribute (id 794) set to true for a CKD patient", () => {
    const payload = mapToHealthMatchPayload(baseLead, baseScreening, "site-1", 400);
    const ckdAttr = payload.attributeValueInput.find((a) => a.attributeDefinitionId === 794);
    expect(ckdAttr?.booleanAttributeValue).toBe(true);
  });

  it("sets type-2 diabetes attribute (id 702) correctly", () => {
    const screening = { ...baseScreening, diabetesType: "type2" as const };
    const payload = mapToHealthMatchPayload(baseLead, screening, "site-1", 400);
    const t2 = payload.attributeValueInput.find((a) => a.attributeDefinitionId === 702);
    const t1 = payload.attributeValueInput.find((a) => a.attributeDefinitionId === 1356);
    expect(t2?.booleanAttributeValue).toBe(true);
    expect(t1?.booleanAttributeValue).toBe(false);
  });

  it("includes African ancestry radio attribute only when true", () => {
    const withAncestry = mapToHealthMatchPayload(
      baseLead,
      { ...baseScreening, hasAfricanAncestry: true },
      "site-1",
      400
    );
    const without = mapToHealthMatchPayload(baseLead, baseScreening, "site-1", 400);

    expect(withAncestry.attributeValueInput.some((a) => a.attributeDefinitionId === 26748)).toBe(true);
    expect(without.attributeValueInput.some((a) => a.attributeDefinitionId === 26748)).toBe(false);
  });
});
