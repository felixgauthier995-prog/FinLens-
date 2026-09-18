import type { ReactNode } from "react";

export function ArticleSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-border py-6 first:border-t-0 first:pt-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">{eyebrow}</p>
      <h2 className="mt-1.5 text-[16px] font-semibold text-ink-950">{title}</h2>
      <div className="mt-2.5 text-[14.5px] leading-relaxed text-ink-800">{children}</div>
    </section>
  );
}
