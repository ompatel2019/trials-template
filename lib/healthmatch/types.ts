export type AttributeValueInput =
  | { attributeDefinitionId: number; isSkipped: false; booleanAttributeValue: boolean }
  | { attributeDefinitionId: number; isSkipped: false; floatAttributeValue: number }
  | { attributeDefinitionId: number; isSkipped: false; radioAttributeValue: string };

export type EmrConsent = {
  consentSignedAt: string;
  consentTemplateVersion: number;
};

export type Attribution = {
  medium: string;
  source: string;
  sourceOriginUrl?: string;
  campaign?: string;
  audience?: string;
  matchType?: string;
  adId?: string;
  adSetId?: string;
  clickId?: string;
};

export type HealthMatchReferralPayload = {
  email: string;
  firstName: string;
  lastName: string;
  consentToHmTCsVersion: string;
  sex: "M" | "F";
  dob: string;
  condition: string;
  country: string;
  suburb: string;
  address: string;
  phoneNumber: string;
  localeCode: string;
  thirdPartyContactConsentVersion: string;
  consentLocaleCode: string;
  trialSiteId: string;
  attributeValueInput: AttributeValueInput[];
  emrConsent: EmrConsent;
  doctorDetails?: string;
  attribution: Attribution;
};

export type HealthMatchSuccessResponse = {
  status: "success";
  outcome: Record<string, unknown>;
};

export type HealthMatchErrorResponse = {
  status: "error";
  message: string;
};

export type HealthMatchResponse = HealthMatchSuccessResponse | HealthMatchErrorResponse;

export type TrialSiteConsent = {
  template: { version: string };
  preamble: string;
  consent: string;
  confirmedButtonText: string;
  declinedButtonText: string;
  localeCode: string;
};

export type NearestTrialSiteResult = {
  trialSiteId: string;
  consent: TrialSiteConsent;
};

export type GraphQLNearestSiteResponse = {
  data: {
    trial: {
      id: string;
      closestTrialSite: {
        id: string;
        trial: { id: string };
        consent: TrialSiteConsent;
      };
    };
  };
};
