import type { GraphQLNearestSiteResponse, NearestTrialSiteResult } from "./types";

const GRAPHQL_URL = process.env.HEALTHMATCH_GRAPHQL_URL || "https://graphql-api.healthmatch.io/graphql";

const GET_NEAREST_TRIAL_SITE_QUERY = `query GetNearestTrialSite($trialId: TrialID!, $countryCode: CountryCode!, $postalCode: String!, $localeCode: LocaleCode) {
  trial(id: $trialId) {
    id
    closestTrialSite(
      criteria: {useNewPatientDetails: {countryCode: $countryCode, zipCode: $postalCode}, useLongDistanceMatching: false}
    ) {
      id
      trial {
        id
        __typename
      }
      consent(localeCode: $localeCode) {
        template {
          version
          __typename
        }
        preamble
        consent
        confirmedButtonText
        declinedButtonText
        localeCode
        __typename
      }
      __typename
    }
    __typename
  }
}`;

export async function getNearestTrialSite(
  trialId: string,
  postalCode: string,
  countryCode = "US",
  localeCode = "EN"
): Promise<NearestTrialSiteResult> {
  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      operationName: "GetNearestTrialSite",
      variables: { trialId, countryCode, postalCode, localeCode },
      query: GET_NEAREST_TRIAL_SITE_QUERY,
    }),
  });

  if (!response.ok) {
    throw new Error(`HealthMatch GraphQL returned ${response.status}: ${await response.text()}`);
  }

  const json = (await response.json()) as GraphQLNearestSiteResponse;
  const site = json.data?.trial?.closestTrialSite;

  if (!site) {
    throw new Error(`No trial site found for postal code ${postalCode}`);
  }

  return {
    trialSiteId: site.id,
    consent: site.consent,
  };
}
