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
    <div className="divide-y divide-gray-200 border-y border-gray-200">
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => toggle(i)}
            className="w-full flex items-center justify-between py-5 text-left cursor-pointer"
          >
            <span className="text-base font-medium text-gray-900 pr-8">
              {item.question}
            </span>
            <svg
              className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200 ${
                openIndex === i ? "rotate-180" : ""
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
            className={`grid transition-all duration-200 ${
              openIndex === i ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <p className="text-gray-600 leading-relaxed">{item.answer}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
