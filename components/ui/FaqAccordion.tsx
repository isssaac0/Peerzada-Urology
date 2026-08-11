"use client";

import { useState } from "react";
import type { FaqItem } from "@/types/content";

export function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!faqs?.length) return null;

  return (
    <div className="divide-y divide-ink-muted/15 rounded-card border border-ink-muted/15">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={faq.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="font-semibold text-ink">{faq.question}</span>
              <span
                aria-hidden="true"
                className={`shrink-0 text-xl text-accent transition-transform ${
                  isOpen ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </button>
            {isOpen ? (
              <p className="px-6 pb-5 text-ink-muted">{faq.answer}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
