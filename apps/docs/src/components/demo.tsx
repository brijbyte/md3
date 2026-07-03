import type * as React from "react";

// Server-safe demo scaffolding shared by all component pages.
export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 rounded-extra-large bg-surface-container-low px-7 pt-6 pb-7">
      <h2 className="mb-2 font-brand text-title-large">{title}</h2>
      {children}
    </section>
  );
}

// Live-demo surface for MDX content: drop components in, they render as-is.
export function Demo({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 flex flex-wrap items-center gap-4 rounded-extra-large bg-surface-container-low p-6">
      {children}
    </div>
  );
}

export function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-4 py-3">
      <span className="w-22.5 shrink-0 text-label-large text-on-surface-variant capitalize">
        {label}
      </span>
      {children}
    </div>
  );
}
