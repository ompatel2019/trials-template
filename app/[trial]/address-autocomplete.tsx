"use client";

import { useRef, useEffect, memo } from "react";

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

  useEffect(() => {
    if (typeof window === "undefined" || !wrapperRef.current || initialized.current) return;

    function attach() {
      if (!wrapperRef.current || initialized.current) return;
      const places = window.google?.maps?.places;
      if (!places?.PlaceAutocompleteElement) return;

      const el = new places.PlaceAutocompleteElement({
        includedRegionCodes: ["us"],
      }) as HTMLElement & EventTarget;

      el.style.setProperty("display", "block");
      el.style.setProperty("width", "100%");
      el.style.setProperty("background-color", "white");
      el.style.setProperty("border", "1px solid var(--rule)");
      el.style.setProperty("border-radius", "0.5rem");
      el.style.setProperty("box-shadow", "none");
      el.style.setProperty("color", "var(--ink)");
      el.style.setProperty("color-scheme", "light");
      el.setAttribute("placeholder", placeholder || "Start typing your address...");

      wrapperRef.current!.appendChild(el);

      // Apply initial value as the input attribute
      if (value) {
        (el as HTMLInputElement).value = value;
      }

      el.addEventListener("gmp-placeselect", async (e: Event) => {
        const place = (e as CustomEvent).detail?.place;
        if (!place) return;
        await place.fetchFields({ fields: ["formattedAddress"] });
        onSelectRef.current(place.formattedAddress ?? "");
      });

      // Capture free-text input for partial values
      el.addEventListener("input", (e: Event) => {
        onSelectRef.current((e.target as HTMLInputElement).value ?? "");
      });

      initialized.current = true;
    }

    if (window.google?.maps?.places?.PlaceAutocompleteElement) {
      attach();
    } else {
      const interval = setInterval(() => {
        if (window.google?.maps?.places?.PlaceAutocompleteElement) {
          clearInterval(interval);
          attach();
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, []); // run once on mount

  return <div ref={wrapperRef} />;
}

export default memo(AddressAutocompleteInner);
