/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
import type { TrialQuestion, ContactField } from "@/lib/trials/types";

vi.mock("@/lib/data/eligible-zips-ckd14", () => ({
  ELIGIBLE_ZIPS_CKD14: new Set(["30301"]),
}));

vi.mock("@/app/[trial]/address-autocomplete", () => ({
  default: ({
    value,
    onSelect,
    placeholder,
  }: {
    value: string;
    onSelect: (address: string) => void;
    placeholder?: string;
  }) => (
    <input
      aria-label="Address"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onSelect(e.target.value)}
    />
  ),
}));

vi.mock("@/app/[trial]/consent-step", () => ({
  default: ({
    onConsentsComplete,
  }: {
    onConsentsComplete: (consents: {
      healthmatchTerms: boolean;
      emrConsent: boolean;
      siteConsent: boolean;
    }) => void;
  }) => (
    <button
      type="button"
      onClick={() =>
        onConsentsComplete({
          healthmatchTerms: true,
          emrConsent: true,
          siteConsent: true,
        })
      }
    >
      Complete consent
    </button>
  ),
}));

import TrialForm from "@/app/[trial]/trial-form";

const minimalQuestions: TrialQuestion[] = [
  {
    id: "ckd_diagnosis",
    question: "Have you been diagnosed with chronic kidney disease?",
    type: "select",
    options: ["Yes, currently", "No"],
    required: true,
    disqualifyIf: ["No"],
  },
];

const contactFields: ContactField[] = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "zipCode",
  "address",
  "dob",
  "sex",
  "ethnicity",
  "doctorDetails",
];

function setAttributionSearchParams(clickid: string, affId: string) {
  window.history.replaceState({}, "", `/?clickid=${clickid}&aff_id=${encodeURIComponent(affId)}`);
}

function findFetchBody(urlFragment: string, event?: string): Record<string, unknown> | undefined {
  const call = fetchMock.mock.calls.find((c) => {
    if (!String(c[0]).includes(urlFragment)) return false;
    if (!event) return true;
    const body = JSON.parse((c[1] as RequestInit).body as string);
    return body.event === event;
  });
  if (!call) return undefined;
  return JSON.parse((call[1] as RequestInit).body as string);
}

let fetchMock: ReturnType<typeof vi.fn>;

describe("TrialForm attribution", () => {
  beforeEach(() => {
    fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes("healthmatch.io/graphql")) {
        return Promise.resolve({
          json: async () => ({
            data: { trial: { closestTrialSite: { consent: { preamble: "", consent: "Site consent" } } } },
          }),
        });
      }
      if (url.includes("/lander/api/leadspedia")) {
        return Promise.resolve({
          json: async () => ({ result: "success", price: 45, lead_id: "test-lead" }),
        });
      }
      if (url.includes("leadspedia_rev_write.php")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ result: "ok", id: 1 }),
        });
      }
      return Promise.resolve({ ok: true });
    });
    vi.stubGlobal("fetch", fetchMock);
    setAttributionSearchParams("click999", "8734_5000_test");
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("tracks page_visit with affId and clickId from URL params", async () => {
    render(
      <TrialForm
        trialId="ckd-001"
        trialCode="ckd14"
        questions={minimalQuestions}
        contactFields={contactFields}
      />
    );

    await waitFor(() => {
      const body = findFetchBody("/lander/api/track", "page_visit");
      expect(body?.affId).toBe("8734_5000_test");
      expect(body?.clickId).toBe("click999");
    });
  });

  it("includes attribution in leadspedia submission payload", async () => {
    render(
      <TrialForm
        trialId="ckd-001"
        trialCode="ckd14"
        questions={minimalQuestions}
        contactFields={contactFields}
        healthmatchTrialId="AZCKDD6800C00005"
      />
    );

    // Screening — select qualifying answer (auto-advances after 300ms)
    fireEvent.click(screen.getByText("Yes, currently"));
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    // Contact part 1
    fireEvent.change(screen.getByPlaceholderText("First Name"), { target: { value: "Jane" } });
    fireEvent.change(screen.getByPlaceholderText("Last Name"), { target: { value: "Doe" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "jane@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Phone (must be 10 digits)"), { target: { value: "4045551234" } });
    fireEvent.change(screen.getByPlaceholderText("Zip Code"), { target: { value: "30301" } });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    // Contact part 2a
    fireEvent.change(screen.getByPlaceholderText("mm/dd/yyyy"), { target: { value: "01/15/1990" } });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Female" } });
    fireEvent.change(screen.getByLabelText("Address"), { target: { value: "123 Main St, Atlanta, GA" } });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    // Contact part 2b — ethnicity required
    fireEvent.click(screen.getByText("White"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    // Consent + submit
    fireEvent.click(screen.getByRole("button", { name: /complete consent/i }));

    await waitFor(() => {
      const body = findFetchBody("/lander/api/leadspedia");
      expect(body?.attribution).toEqual({
        affId: "8734_5000_test",
        clickId: "click999",
      });
    });
  });

  it("writes leadspedia_rev from the browser after LeadsPedia success", async () => {
    render(
      <TrialForm
        trialId="ckd-001"
        trialCode="ckd14"
        questions={minimalQuestions}
        contactFields={contactFields}
        healthmatchTrialId="AZCKDD6800C00005"
      />
    );

    fireEvent.click(screen.getByText("Yes, currently"));
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    fireEvent.change(screen.getByPlaceholderText("First Name"), { target: { value: "Jane" } });
    fireEvent.change(screen.getByPlaceholderText("Last Name"), { target: { value: "Doe" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "jane@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Phone (must be 10 digits)"), { target: { value: "4045551234" } });
    fireEvent.change(screen.getByPlaceholderText("Zip Code"), { target: { value: "30301" } });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    fireEvent.change(screen.getByPlaceholderText("mm/dd/yyyy"), { target: { value: "01/15/1990" } });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Female" } });
    fireEvent.change(screen.getByLabelText("Address"), { target: { value: "123 Main St, Atlanta, GA" } });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    fireEvent.click(screen.getByText("White"));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    fireEvent.click(screen.getByRole("button", { name: /complete consent/i }));

    await waitFor(() => {
      const body = findFetchBody("leadspedia_rev_write.php");
      expect(body).toEqual({
        ext_buyer: "goolablander_leadspedia",
        int_offer_id: "ckd14",
        aff_id: "8734_5000_test",
        revenue: 45,
        lead_id: "test-lead",
      });
    });
  });
});
