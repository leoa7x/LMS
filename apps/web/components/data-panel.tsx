"use client";

import { ReactNode } from "react";

type DataPanelProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function DataPanel({ title, description, children }: DataPanelProps) {
  return (
    <section className="rounded-3xl border border-cloud bg-white p-6 shadow-sm">
      <header className="mb-5">
        <h3 className="font-display text-xl font-semibold tracking-tight text-slate-950">
          {title}
        </h3>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}
