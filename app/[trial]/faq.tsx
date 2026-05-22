"use client";

import { useState } from "react";

type FaqItem = {
  question: string;
  answer: string;
};

const items: FaqItem[] = [
  {
    question: "What is a clinical trial?",
    answer:
      "A clinical trial is a research study that tests new treatments, therapies, or medical devices in people. These studies help determine whether new approaches are safe and effective before they become widely available.",
  },
  {
    question: "Is there any cost to participate?",
    answer:
      "No. All study-related care, medications, and procedures are provided at no cost to you. Some studies also offer compensation for your time and travel.",
  },
  {
    question: "What happens after I submit the form?",
    answer:
      "A study coordinator will review your information and contact you within 24 hours to discuss the next steps. If you appear to be a good fit, they'll schedule an initial screening visit.",
  },
  {
    question: "Can I leave the study at any time?",
    answer:
      "Yes. Participation is completely voluntary. You can withdraw from the study at any point, for any reason, without affecting your regular medical care.",
  },
  {
    question: "Will I receive a placebo?",
    answer:
      "This depends on the study design. Your coordinator will explain whether a placebo is part of the trial before you enroll, so you can make a fully informed decision.",
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(i: number) {
    setOpenIndex(openIndex === i ? null : i);
  }

  return (
    <div className="border-t border-[var(--rule)]">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={i} className="border-b border-[var(--rule)]">
            <button
              onClick={() => toggle(i)}
              className="w-full flex items-center justify-between py-6 text-left cursor-pointer group/faq"
            >
              <span className={`text-[17px] font-semibold pr-8 leading-[1.4] tracking-[-0.005em] transition-colors duration-200 ${
                open ? "text-[var(--blue)]" : "text-[var(--ink)] group-hover/faq:text-[var(--blue)]"
              }`}>
                {item.question}
              </span>
              <svg
                className={`w-5 h-5 shrink-0 transition-[transform,color] duration-200 ${
                  open ? "rotate-180 text-[var(--blue)]" : "text-[var(--ink-3)] group-hover/faq:text-[var(--ink)]"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              className={`grid transition-all duration-300 ease-out ${
                open ? "grid-rows-[1fr] pb-6" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="text-[15.5px] text-[var(--ink-2)] leading-[1.6] max-w-[660px] m-0">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
