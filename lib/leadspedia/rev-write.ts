export const LEADSPEDIA_REV_WRITE_URL =
  process.env.NEXT_PUBLIC_LEADSPEDIA_REV_WRITE_URL ||
  "https://findlawnetwork.com/leadspedia/leadspedia_rev_write.php";

export type LeadspediaRevPayload = {
  intOfferId: string;
  affId: string;
  revenue: number;
  leadId?: string;
  extBuyer?: string;
};

/** Browser-side rev row write (CORS + Origin auth on findlawnetwork). */
export async function writeLeadspediaRev(payload: LeadspediaRevPayload): Promise<void> {
  const body = {
    ext_buyer: payload.extBuyer || "goolablander_leadspedia",
    int_offer_id: payload.intOfferId,
    aff_id: payload.affId,
    revenue: payload.revenue,
    ...(payload.leadId ? { lead_id: payload.leadId } : {}),
  };

  const res = await fetch(LEADSPEDIA_REV_WRITE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`leadspedia_rev write HTTP ${res.status}: ${text.slice(0, 200)}`);
  }

  const json = (await res.json()) as { result?: string; message?: string };
  if (json.result !== "ok") {
    throw new Error(json.message || "leadspedia_rev write failed");
  }
}
