import type { AttributeValueInput } from "./types";

const HISPANIC_LATINO_ID = 22519;
const ETHNICITY_1_ID = 22520;
const ETHNICITY_2_ID = 22521;
const MULTI_RACIAL_ID = 22500;

const ETHNICITY_OPTION_IDS: Record<string, { first: string; second: string }> = {
  "American Indian or Alaska Native": { first: "000-6ls1x", second: "000-9c7gt" },
  "Asian": { first: "001-xcv8ve", second: "001-cnn2pt" },
  "Black or African American": { first: "002-uumkxi", second: "002-fwz8kf" },
  "Native Hawaiian or Other Pacific Islander": { first: "003-lnrhpu", second: "003-rk0r6j" },
  "White": { first: "004-1addnv", second: "004-3ef4lq" },
  "Other": { first: "005-1o2epp", second: "005-gbj0dm" },
  "I'd prefer not to answer": { first: "006-6i6gur", second: "006-15be6" },
};

export function mapUsEthnicityToAttributes(selectedEthnicities: string[]): AttributeValueInput[] {
  const result: AttributeValueInput[] = [];

  result.push({
    attributeDefinitionId: HISPANIC_LATINO_ID,
    isSkipped: false,
    booleanAttributeValue: selectedEthnicities.includes("Hispanic or Latino"),
  });

  const nonHispanic = selectedEthnicities
    .filter((e) => e !== "Hispanic or Latino" && e in ETHNICITY_OPTION_IDS)
    .sort((a, b) => a.localeCompare(b));

  if (nonHispanic[0]) {
    result.push({
      attributeDefinitionId: ETHNICITY_1_ID,
      isSkipped: false,
      radioAttributeValue: ETHNICITY_OPTION_IDS[nonHispanic[0]].first,
    });
  }

  if (nonHispanic[1]) {
    result.push({
      attributeDefinitionId: ETHNICITY_2_ID,
      isSkipped: false,
      radioAttributeValue: ETHNICITY_OPTION_IDS[nonHispanic[1]].second,
    });
  }

  result.push({
    attributeDefinitionId: MULTI_RACIAL_ID,
    isSkipped: false,
    booleanAttributeValue: nonHispanic.length >= 2,
  });

  return result;
}
