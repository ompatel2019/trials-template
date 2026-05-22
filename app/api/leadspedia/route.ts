import { NextRequest, NextResponse } from "next/server";
import { ELIGIBLE_ZIPS_CKD14 } from "@/lib/data/eligible-zips-ckd14";

const LEADSPEDIA_POST_URL =
  process.env.LEADSPEDIA_POST_URL || "https://helplaw.leadspediatrack.com/post.do";
const LEADSPEDIA_CAMPAIGN_ID = process.env.LEADSPEDIA_CAMPAIGN_ID || "6334ddaf1c58d";
const LEADSPEDIA_CAMPAIGN_KEY = process.env.LEADSPEDIA_CAMPAIGN_KEY || "MFbmdK3xjv4ZGwnXY2pQ";

type FormPayload = {
  trial: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  zipCode: string;
  dob: string;
  sex: string;
  address: string;
  screening: Record<string, unknown>;
  consents: Record<string, boolean>;
  attribution?: { affId?: string };
  doctorDetails?: string;
  ethnicity?: string[];
};

function buildScreeningSummary(screening: Record<string, unknown>): string {
  const parts: string[] = [];
  if (screening.heightCm) parts.push(`Height: ${screening.heightCm}cm`);
  if (screening.weightKg) parts.push(`Weight: ${screening.weightKg}kg`);
  if (screening.hasCkd) parts.push("CKD: Yes");
  if (screening.diabetesType && screening.diabetesType !== "none") {
    parts.push(`Diabetes: ${screening.diabetesType}`);
  }
  if (screening.usesInsulin) parts.push("Insulin: Yes");
  if (screening.hasAfricanAncestry) parts.push("African ancestry: Yes");
  return parts.join("; ") || "No screening data";
}

// Compact screening JSON for LeadsPedia (max 500 chars).
// Relay expands these short keys back to full ScreeningData.
function buildCompactScreening(screening: Record<string, unknown>): string {
  const compact: Record<string, unknown> = {
    h: screening.heightCm || 0,
    w: screening.weightKg || 0,
    ckd: screening.hasCkd ? 1 : 0,
    dia: screening.diabetesType === "type2" ? 2 : screening.diabetesType === "type1" ? 1 : 0,
    ins: screening.usesInsulin ? 1 : 0,
    dly: screening.onDialysis ? 1 : 0,
    kt: screening.hadKidneyTransplant ? 1 : 0,
    hb: screening.hasHepatitisB ? 1 : 0,
    hc: screening.hasHepatitisC ? 1 : 0,
    sc: screening.hasSickleCellDisease ? 1 : 0,
    ld: screening.hasLiverDisease ? 1 : 0,
    qt: screening.hasLongQT ? 1 : 0,
    bd: screening.hasBleedingDisorder ? 1 : 0,
    ca: screening.hasCancerPast5Years ? 1 : 0,
    stk: screening.hadStroke3Months ? 1 : 0,
    ha: screening.hadHeartAttack6Months ? 1 : 0,
    cr: screening.hadCoronaryRevascularization ? 1 : 0,
    ot: screening.hadOrganTransplant ? 1 : 0,
    ct: screening.inClinicalTrial ? 1 : 0,
    aa: screening.hasAfricanAncestry ? 1 : 0,
  };

  if (Array.isArray(screening.ethnicities) && screening.ethnicities.length > 0) {
    compact.eth = screening.ethnicities;
  }

  return JSON.stringify(compact);
}

function mapSexToGender(sex: string): string {
  if (sex === "M" || sex === "Male") return "M";
  if (sex === "F" || sex === "Female") return "F";
  return "";
}

export async function POST(request: NextRequest) {
  let body: FormPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ result: "error", message: "Invalid JSON body" }, { status: 400 });
  }

  const { trial, firstName, lastName, email, phone, zipCode, dob, sex, address, screening, attribution, doctorDetails } = body;

  if (!firstName || !lastName || !email || !phone || !zipCode || !dob || !trial) {
    return NextResponse.json(
      { result: "error", message: "Missing required fields" },
      { status: 400 }
    );
  }

  const paddedZip = zipCode.padStart(5, "0");
  if (!ELIGIBLE_ZIPS_CKD14.has(paddedZip)) {
    return NextResponse.json(
      { result: "error", message: "ZIP code not eligible for this trial" },
      { status: 400 }
    );
  }

  const comments = buildScreeningSummary(screening || {});
  const screeningJson = buildCompactScreening(screening || {});
  const affId = attribution?.affId || "goodlab_direct";

  const formData = new URLSearchParams({
    lp_response: "json",
    lp_campaign_id: LEADSPEDIA_CAMPAIGN_ID,
    lp_campaign_key: LEADSPEDIA_CAMPAIGN_KEY,
    first_name: firstName,
    last_name: lastName,
    phone_home: phone,
    zip_code: paddedZip,
    email_address: email,
    aff_id: affId,
    trial,
    dob,
    gender: mapSexToGender(sex),
    address: address || "",
    comments,
    screening_json: screeningJson,
  });

  if (doctorDetails) {
    formData.append("doctor_details", doctorDetails);
  }

  try {
    const lpResponse = await fetch(LEADSPEDIA_POST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const lpText = await lpResponse.text();
    let lpJson: { result?: string; price?: number; lead_id?: string };
    try {
      lpJson = JSON.parse(lpText);
    } catch {
      console.error("LeadsPedia non-JSON response:", lpText);
      return NextResponse.json(
        { result: "error", message: "Invalid response from lead processor" },
        { status: 502 }
      );
    }

    if (lpJson.result === "success") {
      return NextResponse.json({
        result: "success",
        price: lpJson.price,
        lead_id: lpJson.lead_id,
      });
    }

    return NextResponse.json({
      result: "failed",
      price: 0,
      message: lpJson.result || "Lead not accepted",
    });
  } catch (error) {
    console.error("LeadsPedia request failed:", error);
    return NextResponse.json(
      { result: "error", message: "Failed to submit lead" },
      { status: 500 }
    );
  }
}
