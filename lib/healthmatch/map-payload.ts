import type { AttributeValueInput, HealthMatchReferralPayload } from "./types";
import { mapUsEthnicityToAttributes } from "./ethnicity";

export type ScreeningData = {
  heightCm: number;
  weightKg: number;
  hasCkd: boolean;
  diabetesType: "none" | "type2" | "type1";
  usesInsulin: boolean;
  onDialysis: boolean;
  hadKidneyTransplant: boolean;
  hasHepatitisB: boolean;
  hasHepatitisC: boolean;
  hasSickleCellDisease: boolean;
  hasLiverDisease: boolean;
  hasLongQT: boolean;
  hasBleedingDisorder: boolean;
  hasCancerPast5Years: boolean;
  hadStroke3Months: boolean;
  hadHeartAttack6Months: boolean;
  hadCoronaryRevascularization: boolean;
  hadOrganTransplant: boolean;
  inClinicalTrial: boolean;
  hasAfricanAncestry: boolean;
  ethnicities: string[];
};

export type LeadData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  sex: "M" | "F";
  address: string;
  zipCode: string;
  doctorDetails?: string;
};

function buildAttributeValueInput(screening: ScreeningData): AttributeValueInput[] {
  const attrs: AttributeValueInput[] = [];

  // African ancestry
  attrs.push({
    attributeDefinitionId: 26748,
    isSkipped: false,
    radioAttributeValue: screening.hasAfricanAncestry ? "000-kiodu" : "001-abcde",
  });

  // CKD diagnosis
  attrs.push({
    attributeDefinitionId: 794,
    isSkipped: false,
    booleanAttributeValue: screening.hasCkd,
  });

  // Dialysis / transplant cluster
  attrs.push({
    attributeDefinitionId: 20342,
    isSkipped: false,
    booleanAttributeValue: screening.onDialysis,
  });
  attrs.push({
    attributeDefinitionId: 396,
    isSkipped: false,
    booleanAttributeValue: screening.hadKidneyTransplant,
  });
  attrs.push({
    attributeDefinitionId: 20254,
    isSkipped: false,
    booleanAttributeValue: screening.onDialysis,
  });
  attrs.push({
    attributeDefinitionId: 15039,
    isSkipped: false,
    booleanAttributeValue: screening.hadKidneyTransplant,
  });

  // Kidney disease cause (lupus / IgA) — hardcoded false for qualifying patients
  attrs.push({
    attributeDefinitionId: 21985,
    isSkipped: false,
    booleanAttributeValue: false,
  });
  attrs.push({
    attributeDefinitionId: 26683,
    isSkipped: false,
    booleanAttributeValue: false,
  });

  // Height
  attrs.push({
    attributeDefinitionId: 15264,
    isSkipped: false,
    floatAttributeValue: screening.heightCm,
  });

  // Weight
  attrs.push({
    attributeDefinitionId: 5,
    isSkipped: false,
    floatAttributeValue: screening.weightKg,
  });

  // Diabetes
  attrs.push({
    attributeDefinitionId: 702,
    isSkipped: false,
    booleanAttributeValue: screening.diabetesType === "type2",
  });
  attrs.push({
    attributeDefinitionId: 1356,
    isSkipped: false,
    booleanAttributeValue: screening.diabetesType === "type1",
  });

  // Insulin use
  attrs.push({
    attributeDefinitionId: 23574,
    isSkipped: false,
    booleanAttributeValue: screening.usesInsulin,
  });

  // Insulin duration — hardcoded false (less than 3 months) for qualifying patients
  attrs.push({
    attributeDefinitionId: 26773,
    isSkipped: false,
    booleanAttributeValue: false,
  });

  // Medical conditions
  attrs.push({
    attributeDefinitionId: 15040,
    isSkipped: false,
    booleanAttributeValue: screening.hasHepatitisB,
  });
  attrs.push({
    attributeDefinitionId: 834,
    isSkipped: false,
    booleanAttributeValue: screening.hasHepatitisC,
  });
  attrs.push({
    attributeDefinitionId: 25006,
    isSkipped: false,
    booleanAttributeValue: screening.hasSickleCellDisease,
  });
  attrs.push({
    attributeDefinitionId: 21026,
    isSkipped: false,
    booleanAttributeValue: screening.hasLiverDisease,
  });
  attrs.push({
    attributeDefinitionId: 23739,
    isSkipped: false,
    booleanAttributeValue: screening.hasLongQT,
  });
  attrs.push({
    attributeDefinitionId: 15061,
    isSkipped: false,
    booleanAttributeValue: screening.hasBleedingDisorder,
  });
  attrs.push({
    attributeDefinitionId: 25310,
    isSkipped: false,
    booleanAttributeValue: screening.hasCancerPast5Years,
  });

  // Recent events
  attrs.push({
    attributeDefinitionId: 1370,
    isSkipped: false,
    booleanAttributeValue: screening.hadStroke3Months,
  });
  attrs.push({
    attributeDefinitionId: 6775,
    isSkipped: false,
    booleanAttributeValue: screening.hadHeartAttack6Months,
  });
  attrs.push({
    attributeDefinitionId: 25414,
    isSkipped: false,
    booleanAttributeValue: screening.hadCoronaryRevascularization,
  });
  attrs.push({
    attributeDefinitionId: 15039,
    isSkipped: false,
    booleanAttributeValue: screening.hadOrganTransplant,
  });

  // Clinical trial participation
  attrs.push({
    attributeDefinitionId: 23777,
    isSkipped: false,
    booleanAttributeValue: screening.inClinicalTrial,
  });

  // Ethnicity attributes
  const ethnicityAttrs = mapUsEthnicityToAttributes(screening.ethnicities);
  attrs.push(...ethnicityAttrs);

  return attrs;
}

export function mapToHealthMatchPayload(
  lead: LeadData,
  screening: ScreeningData,
  trialSiteId: string,
  conditionId: string
): HealthMatchReferralPayload {
  return {
    email: lead.email,
    firstName: lead.firstName,
    lastName: lead.lastName,
    consentToHmTCsVersion: "latest",
    sex: lead.sex,
    dob: lead.dob,
    condition: conditionId,
    country: "US",
    suburb: lead.zipCode,
    address: lead.address,
    phoneNumber: lead.phone,
    localeCode: "EN",
    thirdPartyContactConsentVersion: "4",
    consentLocaleCode: "EN",
    trialSiteId,
    attributeValueInput: buildAttributeValueInput(screening),
    emrConsent: {
      consentedSignedAt: new Date().toISOString(),
      consentTemplateVersion: 2,
    },
    doctorDetails: lead.doctorDetails || undefined,
    attribution: {
      medium: "affiliates",
      source: "goodlab",
    },
  };
}
