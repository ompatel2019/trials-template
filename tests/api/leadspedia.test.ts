import { describe, it, expect, vi, beforeEach, type MockInstance } from "vitest";

// ── Mocks must be hoisted before any imports that trigger them ────────────────

vi.mock("next/server", () => {
  const NextResponse = {
    json: (body: unknown, init?: { status?: number }) => ({
      _body: body,
      _status: init?.status ?? 200,
    }),
  };
  return { NextResponse };
});

vi.mock("@/lib/data/eligible-zips-ckd14", () => ({
  ELIGIBLE_ZIPS_CKD14: new Set(["30301", "10001"]),
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: vi.fn(),
}));

vi.mock("fs", () => ({
  default: { existsSync: vi.fn(() => true), appendFileSync: vi.fn(), mkdirSync: vi.fn() },
  existsSync: vi.fn(() => true),
  appendFileSync: vi.fn(),
  mkdirSync: vi.fn(),
}));

// ─────────────────────────────────────────────────────────────────────────────

import { POST } from "@/app/api/leadspedia/route";
import { trackEvent } from "@/lib/analytics";

const trackEventMock = trackEvent as unknown as MockInstance;

function makeRequest(body: Record<string, unknown>) {
  return {
    json: async () => body,
  } as unknown as import("next/server").NextRequest;
}

const validBody = {
  trial: "ckd14",
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  phone: "4045551234",
  zipCode: "30301",
  dob: "01/15/1990",
  sex: "F",
  address: "123 Main St",
  screening: { hasCkd: true, diabetesType: "none" },
  consents: { healthmatchTerms: true, emrConsent: true, siteConsent: true },
};

describe("POST /api/leadspedia", () => {
  let fetchMock: MockInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock = vi.spyOn(globalThis, "fetch");
  });

  it("rejects missing required fields with 400", async () => {
    const res = await POST(makeRequest({ trial: "ckd14", firstName: "Jane" })) as any;
    expect(res._status).toBe(400);
  });

  it("rejects an ineligible ZIP with 400", async () => {
    const res = await POST(makeRequest({ ...validBody, zipCode: "99999" })) as any;
    expect(res._status).toBe(400);
    expect(res._body.message).toMatch(/zip/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends the real aff_id to LeadsPedia when attribution is provided", async () => {
    fetchMock.mockResolvedValueOnce({ text: async () => '{"result":"success","price":50,"lead_id":"abc"}' } as any);
    await POST(makeRequest({ ...validBody, attribution: { affId: "8734_5000_test", clickId: "" } }));

    const [, lpInit] = fetchMock.mock.calls[0];
    const body = new URLSearchParams(lpInit.body as string);
    expect(body.get("aff_id")).toBe("8734_5000_test");
  });

  it("falls back to goodlab_direct when no aff_id is provided", async () => {
    fetchMock.mockResolvedValueOnce({ text: async () => '{"result":"success","price":50,"lead_id":"abc"}' } as any);
    await POST(makeRequest(validBody));

    const [, lpInit] = fetchMock.mock.calls[0];
    const body = new URLSearchParams(lpInit.body as string);
    expect(body.get("aff_id")).toBe("goodlab_direct");
  });

  it("fires Voluum postback with correct cid and payout on success", async () => {
    fetchMock.mockResolvedValue({ text: async () => '{"result":"success","price":45,"lead_id":"xyz"}' } as any);
    await POST(makeRequest({ ...validBody, attribution: { affId: "aff123", clickId: "click999" } }));

    // First fetch = LeadsPedia, second = Voluum postback
    const postbackCall = fetchMock.mock.calls[1];
    expect(postbackCall).toBeDefined();
    const url = new URL(postbackCall[0] as string);
    expect(url.searchParams.get("cid")).toBe("click999");
    expect(url.searchParams.get("payout")).toBe("45");
    expect(url.searchParams.get("currency")).toBe("USD");
  });

  it("does NOT fire Voluum postback when clickId is absent", async () => {
    fetchMock.mockResolvedValue({ text: async () => '{"result":"success","price":45,"lead_id":"xyz"}' } as any);
    await POST(makeRequest(validBody)); // no attribution / clickId

    // Only one fetch call (LeadsPedia), no postback
    expect(fetchMock.mock.calls.length).toBe(1);
  });

  it("stores affId and clickId in the lead_accepted analytics event", async () => {
    fetchMock.mockResolvedValue({ text: async () => '{"result":"success","price":45,"lead_id":"xyz"}' } as any);
    await POST(makeRequest({ ...validBody, attribution: { affId: "aff123", clickId: "click999" } }));

    const acceptedCall = trackEventMock.mock.calls.find((c) => c[0] === "lead_accepted");
    expect(acceptedCall?.[1]).toMatchObject({ affId: "aff123", clickId: "click999" });
  });

  it("returns failed result without firing postback on LeadsPedia rejection", async () => {
    fetchMock.mockResolvedValueOnce({ text: async () => '{"result":"failed","message":"Duplicate Lead","lead_id":"LP999"}' } as any);
    const res = await POST(makeRequest({ ...validBody, attribution: { affId: "aff", clickId: "cid1" } })) as any;

    expect(res._body.result).toBe("failed");
    expect(res._body.lead_id).toBe("LP999");
    // postback must not fire on failure
    expect(fetchMock.mock.calls.length).toBe(1);
  });
});
