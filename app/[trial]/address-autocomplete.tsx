"use client";

import { useRef, useEffect, useCallback, memo } from "react";

type Props = {
  value: string;
  onSelect: (address: string) => void;
  className?: string;
  placeholder?: string;
};

function AddressAutocompleteInner({ value, onSelect, className, placeholder }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const attachAutocomplete = useCallback(() => {
    if (!wrapperRef.current || initialized.current) return;
    if (!window.google?.maps?.places) return;

    const input = document.createElement("input");
    input.type = "text";
    input.className = className || "";
    input.placeholder = placeholder || "Start typing your address...";
    input.value = value || "";

    wrapperRef.current.appendChild(input);

    const autocomplete = new window.google.maps.places.Autocomplete(input, {
      fields: ["formatted_address"],
      types: ["address"],
      componentRestrictions: { country: "us" },
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        onSelectRef.current(place.formatted_address);
      }
    });

    input.addEventListener("input", () => {
      onSelectRef.current(input.value);
    });

    initialized.current = true;
  }, [className, placeholder, value]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.google?.maps?.places) {
      attachAutocomplete();
    } else {
      const interval = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(interval);
          attachAutocomplete();
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [attachAutocomplete]);

  return <div ref={wrapperRef} />;
}

export default memo(AddressAutocompleteInner);
