"use client";

import { useRef, useEffect, useState } from "react";

type Props = {
  value: string;
  onSelect: (address: string, zipCode: string) => void;
  className?: string;
  placeholder?: string;
};

type AddrComp = google.maps.GeocoderAddressComponent;

function getComp(comps: AddrComp[] | undefined, type: string) {
  return comps?.find((c) => c.types.includes(type));
}

function getStreetAddress(comps: AddrComp[] | undefined): string {
  if (!comps) return "";
  const streetNumber = getComp(comps, "street_number")?.long_name ?? "";
  const route = getComp(comps, "route")?.short_name ?? getComp(comps, "route")?.long_name ?? "";
  const premise = getComp(comps, "premise")?.long_name ?? "";
  const subpremise = getComp(comps, "subpremise")?.long_name ?? "";
  const city = getComp(comps, "locality")?.long_name ?? "";
  const state = getComp(comps, "administrative_area_level_1")?.short_name ?? "";

  const main = [streetNumber, route].filter(Boolean).join(" ").trim();
  const extras = [premise, subpremise ? `#${subpremise}` : ""].filter(Boolean).join(", ");
  const street = [main, extras].filter(Boolean).join(", ");
  const full = [street, city, state].filter(Boolean).join(", ");
  return full;
}

export default function AddressAutocomplete({ value, onSelect, className, placeholder }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!window.google?.maps?.places || !inputRef.current) return;
    if (autocompleteRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      fields: ["formatted_address", "address_components"],
      types: ["address"],
      componentRestrictions: { country: "US" },
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.formatted_address) return;

      const streetAddress = getStreetAddress(place.address_components);
      let zipCode = "";
      if (place.address_components) {
        for (const component of place.address_components) {
          if (component.types.includes("postal_code")) {
            zipCode = component.short_name;
            break;
          }
        }
      }

      if (!zipCode) {
        setError("Please select a complete street address with a ZIP code");
        onSelect(streetAddress, "");
        return;
      }

      setError("");
      onSelect(streetAddress, zipCode);
    });

    autocompleteRef.current = autocomplete;

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onSelect]);

  return (
    <div>
      <input
        ref={inputRef}
        type="text"
        className={className}
        placeholder={placeholder || "Start typing your address..."}
        defaultValue={value}
        onChange={(e) => {
          if (error) setError("");
          onSelect(e.target.value, "");
        }}
      />
      {error && (
        <p className="text-red-500 text-[12px] mt-1 m-0">{error}</p>
      )}
    </div>
  );
}
