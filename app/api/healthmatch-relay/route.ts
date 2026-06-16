import { NextRequest, NextResponse } from "next/server";
import { getNearestTrialSite } from "@/lib/healthmatch/graphql";
import { mapToHealthMatchPayload, type ScreeningData, type LeadData } from "@/lib/healthmatch/map-payload";
import type { HealthMatchResponse } from "@/lib/healthmatch/types";
import { trackEvent } from "@/lib/analytics";

const HEALTHMATCH_REFER_URL =
  process.env.HEALTHMATCH_REFER_URL || "https://graphql-api.healthmatch.io/refer-patient";

const TRIAL_ID = "AZCKDD6800C00005";
const CONDITION_ID = 400;

type LeadsPediaDeliveryPayload = {
  first_name: string;
  last_name: string;
  email_address: string;
  phone_home: string;
  zip_code: string;
  dob: string;
  gender: string;
  trial: string;
  address: string;
  comments: string;
  screening_json: string;
  aff_id: string;
  doctor_details?: string;
};

// Accepts both compact format (from LeadsPedia, short keys) and verbose format.
// Compact keys: h, w, ckd, dia, ins, dly, kt, hb, hc, sc, ld, qt, bd, ca, stk, ha, cr, ot, ct, aa, eth
function parseScreeningJson(raw: string): ScreeningData {
  const s = JSON.parse(raw);

  const isCompact = "h" in s || "w" in s || "ckd" in s;

  if (isCompact) {
    return {
      heightCm: s.h || 170,
      weightKg: s.w || 70,
      hasCkd: s.ckd === 1,
      diabetesType: s.dia === 2 ? "type2" : s.dia === 1 ? "type1" : "none",
      usesInsulin: s.ins === 1,
      onDialysis: s.dly === 1,
      hadKidneyTransplant: s.kt === 1,
      hasHepatitisB: s.hb === 1,
      hasHepatitisC: s.hc === 1,
      hasSickleCellDisease: s.sc === 1,
      hasLiverDisease: s.ld === 1,
      hasLongQT: s.qt === 1,
      hasBleedingDisorder: s.bd === 1,
      hasCancerPast5Years: s.ca === 1,
      hadStroke3Months: s.stk === 1,
      hadHeartAttack6Months: s.ha === 1,
      hadCoronaryRevascularization: s.cr === 1,
      hadOrganTransplant: s.ot === 1,
      inClinicalTrial: s.ct === 1,
      hasAfricanAncestry: s.aa === 1,
      ethnicities: s.eth || [],
    };
  }

  return {
    heightCm: s.heightCm || 170,
    weightKg: s.weightKg || 70,
    hasCkd: s.hasCkd ?? true,
    diabetesType: s.diabetesType || "none",
    usesInsulin: s.usesInsulin ?? false,
    onDialysis: s.onDialysis ?? false,
    hadKidneyTransplant: s.hadKidneyTransplant ?? false,
    hasHepatitisB: s.hasHepatitisB ?? false,
    hasHepatitisC: s.hasHepatitisC ?? false,
    hasSickleCellDisease: s.hasSickleCellDisease ?? false,
    hasLiverDisease: s.hasLiverDisease ?? false,
    hasLongQT: s.hasLongQT ?? false,
    hasBleedingDisorder: s.hasBleedingDisorder ?? false,
    hasCancerPast5Years: s.hasCancerPast5Years ?? false,
    hadStroke3Months: s.hadStroke3Months ?? false,
    hadHeartAttack6Months: s.hadHeartAttack6Months ?? false,
    hadCoronaryRevascularization: s.hadCoronaryRevascularization ?? false,
    hadOrganTransplant: s.hadOrganTransplant ?? false,
    inClinicalTrial: s.inClinicalTrial ?? false,
    hasAfricanAncestry: s.hasAfricanAncestry ?? false,
    ethnicities: s.ethnicities || [],
  };
}

export async function POST(request: NextRequest) {
  const rawText = await request.text();
  console.log("RELAY RECEIVED RAW:", rawText);

  let body: LeadsPediaDeliveryPayload;
  try {
    body = JSON.parse(rawText);
  } catch {
    console.error("RELAY: Failed to parse JSON body:", rawText.slice(0, 500));
    return NextResponse.json({ status: "error", message: "Invalid JSON" }, { status: 400 });
  }

  console.log("RELAY PARSED BODY:", JSON.stringify(body));

  const { first_name, last_name, email_address, phone_home, zip_code, dob, gender, address, screening_json, doctor_details } = body;

  if (!first_name || !last_name || !email_address || !phone_home || !zip_code) {
    return NextResponse.json(
      { status: "error", message: "Missing required fields" },
      { status: 400 }
    );
  }

  let screening: ScreeningData;
  try {
    screening = parseScreeningJson(screening_json || "{}");
  } catch {
    console.error("Failed to parse screening_json:", screening_json);
    screening = parseScreeningJson("{}");
  }

  let trialSiteId: string;
  try {
    const siteResult = await getNearestTrialSite(TRIAL_ID, zip_code);
    trialSiteId = siteResult.trialSiteId;
  } catch (error) {
    console.error("HealthMatch GraphQL lookup failed:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to resolve trial site for zip code" },
      { status: 502 }
    );
  }

  const sex = gender === "M" || gender === "Male" ? "M" : "F";

  const lead: LeadData = {
    firstName: first_name,
    lastName: last_name,
    email: email_address,
    phone: phone_home,
    dob,
    sex,
    address: address || "",
    zipCode: zip_code,
    doctorDetails: doctor_details,
  };

  const payload = mapToHealthMatchPayload(lead, screening, trialSiteId, CONDITION_ID);
  console.log("HEALTHMATCH PAYLOAD:", JSON.stringify(payload, null, 2));

  try {
    const hmResponse = await fetch(HEALTHMATCH_REFER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const hmText = await hmResponse.text();
    console.log("HEALTHMATCH RESPONSE STATUS:", hmResponse.status);
    console.log("HEALTHMATCH RESPONSE BODY:", hmText.slice(0, 1000));
    let hmJson: HealthMatchResponse;
    try {
      hmJson = JSON.parse(hmText);
    } catch {
      console.error("HealthMatch non-JSON response:", hmText);
      return NextResponse.json(
        { status: "error", message: "Invalid response from HealthMatch" },
        { status: 502 }
      );
    }

    if (hmJson.status === "success") {
      console.log(`HealthMatch referral success: ${email_address} -> site ${trialSiteId}`);
      trackEvent("relay_success", { trial: body.trial || "ckd14", zip: zip_code, trialSiteId });
      return NextResponse.json({ status: "success", trialSiteId });
    }

    console.error("HealthMatch referral failed:", hmJson.message);
    trackEvent("relay_failed", { trial: body.trial || "ckd14", zip: zip_code, reason: hmJson.message || "Referral failed" });
    return NextResponse.json(
      { status: "error", message: hmJson.message || "Referral failed" },
      { status: 422 }
    );
  } catch (error) {
    console.error("HealthMatch refer-patient request failed:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to submit referral to HealthMatch" },
      { status: 500 }
    );
  }
}
